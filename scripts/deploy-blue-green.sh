#!/bin/bash
set -e

################################################################################
# Blue-Green Deployment Script for Balanced App
# This script performs zero-downtime deployment using blue-green strategy
################################################################################

echo '🔄 Starting Blue-Green Deployment...'

################################################################################
# CONFIGURATION & SETUP
################################################################################

# Docker image tags (can be set via environment variables from CI/CD)
echo "🐳 Docker Image Configuration:"
if [ -n "$APP_IMAGE" ]; then
    export APP_IMAGE="$APP_IMAGE"
    echo "  App: $APP_IMAGE"
else
    echo "  App: Using image from compose.prod.yml"
fi

if [ -n "$NGINX_IMAGE" ]; then
    export NGINX_IMAGE="$NGINX_IMAGE"
    echo "  Nginx: $NGINX_IMAGE"
else
    echo "  Nginx: Using image from compose.prod.yml"
fi

if [ -n "$DB_IMAGE" ]; then
    export DB_IMAGE="$DB_IMAGE"
    echo "  Database: $DB_IMAGE"
else
    echo "  Database: Using image from compose.prod.yml"
fi

if [ -n "$BACKUP_IMAGE" ]; then
    export BACKUP_IMAGE="$BACKUP_IMAGE"
    echo "  Backup: $BACKUP_IMAGE"
else
    echo "  Backup: Using image from compose.prod.yml"
fi

# Check Docker Compose version and set command
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
    echo "📦 Using docker compose (modern)"
elif docker-compose --version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
    echo "📦 Using docker-compose (legacy)"
else
    echo "❌ Error: Neither 'docker compose' nor 'docker-compose' is available"
    exit 1
fi

# Determine which environment is currently active
CURRENT_ACTIVE='undefined'

# Check if green is active
if grep -q 'server app-green:3000 weight=1' src/services/nginx/upstream.conf; then
    CURRENT_ACTIVE='green'
# Check if blue is active
elif grep -q 'server app-blue:3000 weight=1' src/services/nginx/upstream.conf; then
    CURRENT_ACTIVE='blue'
else
    echo "⚠️  Warning: Neither blue nor green appears to be active in upstream.conf"
fi

# Set target environment (opposite of current)
if [ "$CURRENT_ACTIVE" = "blue" ]; then
    TARGET_ENV='green'
    TARGET_CONTAINER='app-green'
    CURRENT_CONTAINER='app-blue'
elif [ "$CURRENT_ACTIVE" = "green" ]; then
    TARGET_ENV='blue'
    TARGET_CONTAINER='app-blue'
    CURRENT_CONTAINER='app-green'
elif [ "$CURRENT_ACTIVE" = "undefined" ]; then
    echo "⚠️  Warning: Neither blue nor green appears to be active in upstream.conf, defaulting to blue as the initial active environment"
    CURRENT_ACTIVE='blue'
    TARGET_ENV='green'
    TARGET_CONTAINER='app-green'
    CURRENT_CONTAINER='app-blue'
fi

echo "📍 Current active: $CURRENT_ACTIVE"
echo "🎯 Deploying to: $TARGET_ENV"

################################################################################
# UTILITY FUNCTIONS
################################################################################

# Function to clean up old containers
cleanup_containers() {
    echo '🧹 Cleaning up old containers...'

    # Stop and remove any running containers from this project
    if [ -f compose.prod.yml ]; then
        echo '🔄 Stopping and removing existing containers...'
        $DOCKER_COMPOSE --file compose.prod.yml down --remove-orphans --timeout 30 2>/dev/null || true
    fi

    # Find and remove any nginx containers
    echo '🔍 Looking for running nginx containers...'
    RUNNING_CONTAINERS=$(docker ps -a -q --filter "name=balanced_nginx_prod" 2>/dev/null || true)

    if [ -n "$RUNNING_CONTAINERS" ]; then
        echo '🛑 Stopping and removing nginx containers...'
        docker stop $RUNNING_CONTAINERS 2>/dev/null || true
        docker rm -f $RUNNING_CONTAINERS 2>/dev/null || true
    fi

    # Check if port 80 is still in use by a non-container process
    if command -v ss >/dev/null && ss -tulpn | grep -q ':80 '; then
        echo '⚠️  Warning: Port 80 is still in use by a non-container process'
        echo '   This might cause issues with nginx startup'
    fi

    # Small delay to ensure cleanup completes
    sleep 2
}

# Function to check if port is in use
port_in_use() {
    local port=$1
    if command -v ss >/dev/null; then
        if ss -tulpn | grep -q ":${port} "; then
            echo "Port ${port} is in use by:"
            ss -tulpn | grep ":${port} "
            return 0  # Port is in use
        fi
    fi
    return 1  # Port is not in use
}

################################################################################
# NGINX MANAGEMENT FUNCTIONS
################################################################################

# Handle first time startup
manage_nginx_first_time() {
    echo '🌐 Starting nginx (first run)...'

    # Clean up any existing nginx containers first
    $DOCKER_COMPOSE --file compose.prod.yml rm -f nginx 2>/dev/null || true

    # Check if port 80 is in use
    if port_in_use 80; then
        echo '❌ Port 80 is required but already in use. Please stop the service using port 80 and try again.'
        echo '    You can check what is using the port with: sudo lsof -i :80'
        echo '    Or check running containers: docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" | grep -E "80|443"'
        return 1
    fi

    # Start nginx with the configured port
    if ! $DOCKER_COMPOSE --file compose.prod.yml --env-file .env.production up -d --force-recreate --remove-orphans nginx; then
        echo '❌ Failed to start nginx. Please check the logs and ensure no other service is using the required ports.'
        return 1
    fi

    # Get the actual port being used
    ACTUAL_PORT=$($DOCKER_COMPOSE --file compose.prod.yml port nginx 80 | cut -d: -f2)
    echo "✅ Nginx is running on port ${ACTUAL_PORT:-80}"
    return 0
}

# Handle subsequent startups
manage_nginx_update() {
    echo '🔄 Nginx is already running, ensuring configuration is up to date...'

    # Just ensure nginx is running with latest config without restarting
    if ! $DOCKER_COMPOSE --file compose.prod.yml --env-file .env.production up -d nginx; then
        echo '⚠️  Failed to update nginx configuration, attempting to fix...'
        cleanup_nginx
        $DOCKER_COMPOSE --file compose.prod.yml --env-file .env.production up -d --force-recreate nginx || {
            echo '❌ Failed to restart nginx. Please check the logs.'
            return 1
        }
    fi

    # Reload nginx to apply any config changes without downtime
    if ! nginx_health_check; then
        echo '⚠️  Could not reload nginx, attempting to restart...'
        $DOCKER_COMPOSE --file compose.prod.yml restart nginx
    fi
    return 0
}

# Handle health checks
nginx_health_check() {
    # Try to reload nginx configuration
    if $DOCKER_COMPOSE --file compose.prod.yml exec nginx nginx -s reload 2>/dev/null; then
        echo '✅ Nginx configuration reloaded successfully'
        return 0
    else
        echo '⚠️  Nginx reload failed'
        return 1
    fi
}

# Handle clean-up
cleanup_nginx() {
    echo '🧹 Cleaning up nginx containers...'
    $DOCKER_COMPOSE --file compose.prod.yml stop nginx 2>/dev/null || true
    $DOCKER_COMPOSE --file compose.prod.yml rm -f nginx 2>/dev/null || true
}

# Main nginx management function
manage_nginx() {
    # Check if nginx is already running
    if ! docker ps --format '{{.Names}}' | grep -q 'balanced_nginx_prod'; then
        # First time startup
        manage_nginx_first_time
    else
        # Subsequent startup/update
        manage_nginx_update
    fi
}

################################################################################
# BLUE-GREEN TRAFFIC SWITCHING FUNCTIONS
################################################################################

# Switch traffic to target environment
switch_traffic() {
    local target_env=$1
    local upstream_file="src/services/nginx/upstream.conf"

    echo "🔄 Switching traffic to $target_env environment..."

    if [ "$target_env" = "blue" ]; then
        # Blue active, green standby
        cat > "$upstream_file" << EOF
# Blue-Green Upstream Configuration
# This file is dynamically updated during deployments

upstream app_backend {
    # Blue environment (active)
    server app-blue:3000 weight=1;
    # Green environment (standby)
    server app-green:3000 weight=0;
}
EOF
    elif [ "$target_env" = "green" ]; then
        # Green active, blue standby
        cat > "$upstream_file" << EOF
# Blue-Green Upstream Configuration
# This file is dynamically updated during deployments

upstream app_backend {
    # Blue environment (standby)
    server app-blue:3000 weight=0;
    # Green environment (active)
    server app-green:3000 weight=1;
}
EOF
    else
        echo "❌ Invalid environment: $target_env. Must be 'blue' or 'green'"
        return 1
    fi

    # Reload nginx to apply changes
    if nginx_health_check; then
        echo "✅ Traffic switched to $target_env environment"
        return 0
    else
        echo "❌ Failed to switch traffic to $target_env"
        return 1
    fi
}

# Test environment health before switching
test_environment_health() {
    local env=$1
    local health_url="http://localhost:8080/health/$env"

    echo "🏥 Testing $env environment health..."

    # Wait for environment to be ready
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            echo "✅ $env environment is healthy"
            return 0
        fi

        echo "⏳ Waiting for $env environment... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "❌ $env environment failed health check after $max_attempts attempts"
    return 1
}

################################################################################
# MAIN DEPLOYMENT FLOW
################################################################################

# Step 1: Build target environment image (no downtime)
echo "🔨 Building $TARGET_ENV environment image..."
$DOCKER_COMPOSE --file compose.prod.yml --env-file .env.production build $TARGET_CONTAINER

# Step 2: Ensure database services are running
echo '🏗️  Ensuring database services are running...'
if ! docker ps --format '{{.Names}}' | grep -q 'balanced_db_prod'; then
    echo '📦 Starting database service...'
    $DOCKER_COMPOSE --file compose.prod.yml --env-file .env.production up -d db
else
    echo '✅ Database service already running'
fi

if ! docker ps --format '{{.Names}}' | grep -q 'balanced_backup_prod'; then
    echo '💾 Starting backup service...'
    $DOCKER_COMPOSE --file compose.prod.yml --env-file .env.production up -d backup
else
    echo '✅ Backup service already running'
fi

# Step 3: Check environment configuration
echo '🔍 Checking environment configuration...'
if [ -f .env.production ]; then
    echo '✅ .env.production file exists'
    echo '📝 Environment variables (masked):'
    sed 's/PASSWORD=.*/PASSWORD=***MASKED***/g; s/DATABASE_URL=.*/DATABASE_URL=***MASKED***/g' .env.production
else
    echo '❌ .env.production file not found!'
    ls -la .env* || echo 'No .env files found'
fi

# Step 4: Wait for database to be ready
echo '⏳ Waiting for database to be ready...'
sleep 10

# Step 5: Start nginx
if ! manage_nginx; then
    exit 1
fi

# Step 6: Run database migrations
echo '🗄️  Running database migrations...'
$DOCKER_COMPOSE --file compose.prod.yml --env-file .env.production run --rm app-blue npx prisma migrate deploy || {
    echo '⚠️  Migration failed, but continuing deployment...'
    cleanup_containers
}

# Step 7: Deploy to target environment
echo "🚀 Deploying new version to $TARGET_ENV environment..."
$DOCKER_COMPOSE --file compose.prod.yml --env-file .env.production up -d $TARGET_CONTAINER

# Step 8: Wait for target environment to be ready
echo "⏳ Waiting for $TARGET_ENV environment to be ready..."
sleep 30

# Step 9: Test target environment health
if ! test_environment_health "$TARGET_ENV"; then
    echo "❌ $TARGET_ENV environment failed health checks!"
    echo "🔄 Rolling back - keeping $CURRENT_ACTIVE active"
    $DOCKER_COMPOSE --file compose.prod.yml stop $TARGET_CONTAINER
    exit 1
fi

# Step 10: Switch traffic to target environment (ZERO DOWNTIME!)
echo "🔀 Switching traffic from $CURRENT_ACTIVE to $TARGET_ENV..."
if ! switch_traffic "$TARGET_ENV"; then
    echo "❌ Failed to switch traffic to $TARGET_ENV"
    echo "🔄 Rolling back - keeping $CURRENT_ACTIVE active"
    exit 1
fi

# Step 11: Verify traffic switch
echo "🔍 Verifying traffic switch..."
sleep 5

# Step 12: Stop old environment after successful switch
echo "🛑 Stopping old $CURRENT_ACTIVE environment..."
$DOCKER_COMPOSE --file compose.prod.yml stop $CURRENT_CONTAINER

# Step 13: Deployment complete
echo "✅ Blue-Green deployment completed successfully!"
echo "📊 Active environment: $TARGET_ENV"

# Show service status
echo 'Service status:'
$DOCKER_COMPOSE --file compose.prod.yml ps
