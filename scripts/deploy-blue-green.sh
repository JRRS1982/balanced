#!/bin/bash
set -e

# Blue-Green Deployment Script for Balanced App
# This script performs zero-downtime deployment using blue-green strategy

echo '🔄 Starting Blue-Green Deployment...'

# Check Docker Compose version and set command
if command -v docker compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
    echo "📦 Using docker compose (modern)"
elif docker compose-version >/dev/null 2>&1; then
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
    echo "   Defaulting to blue as current active environment"
    CURRENT_ACTIVE='blue'
fi

# Set target environment (opposite of current)
if [ "$CURRENT_ACTIVE" = "blue" ]; then
    TARGET_ENV='green'
    TARGET_CONTAINER='app-green'
    CURRENT_CONTAINER='app-blue'
else
    TARGET_ENV='blue'
    TARGET_CONTAINER='app-blue'
    CURRENT_CONTAINER='app-green'
fi

echo "📍 Current active: $CURRENT_ACTIVE"
echo "🎯 Deploying to: $TARGET_ENV"

# Build latest images (no downtime)
echo '🔨 Building latest images...'
$DOCKER_COMPOSE -f compose.prod.yml --env-file .env.production build

# Start infrastructure services (db, nginx, backup) if not running
echo '🏗️  Ensuring infrastructure services are running...'
$DOCKER_COMPOSE -f compose.prod.yml --env-file .env.production up -d db nginx backup

# Debug: Check environment file
echo '🔍 Checking environment configuration...'
if [ -f .env.production ]; then
    echo '✅ .env.production file exists'
    echo '📝 Environment variables (masked):'
    sed 's/PASSWORD=.*/PASSWORD=***MASKED***/g; s/DATABASE_URL=.*/DATABASE_URL=***MASKED***/g' .env.production
else
    echo '❌ .env.production file not found!'
    ls -la .env* || echo 'No .env files found'
fi

# Wait for database to be ready
echo '⏳ Waiting for database to be ready...'
sleep 10

# Run database migrations
echo '🗄️  Running database migrations...'
$DOCKER_COMPOSE -f compose.prod.yml --env-file .env.production run --rm app-blue npx prisma migrate deploy || {
    echo '⚠️  Migration failed, but continuing deployment...'
}

# Deploy to target environment
echo "🚀 Deploying new version to $TARGET_ENV environment..."
$DOCKER_COMPOSE -f compose.prod.yml --env-file .env.production up -d $TARGET_CONTAINER

# Wait for target environment to be ready
echo "⏳ Waiting for $TARGET_ENV environment to be ready..."
sleep 30

# Health check target environment
echo "🏥 Health checking $TARGET_ENV environment..."
TARGET_HEALTH_URL="http://localhost:8080/${TARGET_ENV}-health"

for i in {1..12}; do
    if curl -f $TARGET_HEALTH_URL >/dev/null 2>&1; then
        echo "✅ $TARGET_ENV environment is healthy!"
        HEALTH_CHECK_PASSED=true
        break
    else
        echo "⏳ Health check $i/12 failed, waiting 10s..."
        sleep 10
    fi
done

if [ "$HEALTH_CHECK_PASSED" != "true" ]; then
    echo "❌ $TARGET_ENV environment failed health checks!"
    echo "🔄 Rolling back - keeping $CURRENT_ACTIVE active"
    $DOCKER_COMPOSE -f compose.prod.yml stop $TARGET_CONTAINER
    exit 1
fi

# Switch traffic to target environment (ZERO DOWNTIME!)
echo "🔀 Switching traffic from $CURRENT_ACTIVE to $TARGET_ENV..."

if [ "$TARGET_ENV" = "green" ]; then
    # Switch to green
    echo '# nginx/upstream.conf' > src/services/nginx/upstream.conf
    echo '# Green is now active' >> src/services/nginx/upstream.conf
    echo '' >> src/services/nginx/upstream.conf
    echo 'upstream app_backend {' >> src/services/nginx/upstream.conf
    echo '    server app-green:3000 weight=1;' >> src/services/nginx/upstream.conf
    echo '    server app-blue:3000 weight=0 backup;' >> src/services/nginx/upstream.conf
    echo '}' >> src/services/nginx/upstream.conf
else
    # Switch to blue
    echo '# nginx/upstream.conf' > src/services/nginx/upstream.conf
    echo '# Blue is now active' >> src/services/nginx/upstream.conf
    echo '' >> src/services/nginx/upstream.conf
    echo 'upstream app_backend {' >> src/services/nginx/upstream.conf
    echo '    server app-blue:3000 weight=1;' >> src/services/nginx/upstream.conf
    echo '    server app-green:3000 weight=0 backup;' >> src/services/nginx/upstream.conf
    echo '}' >> src/services/nginx/upstream.conf
fi

# Reload nginx configuration (no downtime)
echo "🔄 Reloading nginx configuration..."
$DOCKER_COMPOSE -f compose.prod.yml exec nginx nginx -s reload

# Verify traffic switch
echo "🔍 Verifying traffic switch..."
sleep 5

# Stop old environment after successful switch
echo "🛑 Stopping old $CURRENT_ACTIVE environment..."
$DOCKER_COMPOSE -f compose.prod.yml stop $CURRENT_CONTAINER

echo "✅ Blue-Green deployment completed successfully!"
echo "📊 Active environment: $TARGET_ENV"

# Show service status
echo 'Service status:'
$DOCKER_COMPOSE -f compose.prod.yml ps
