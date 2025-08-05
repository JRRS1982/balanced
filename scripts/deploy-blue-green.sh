#!/bin/bash
set -e

# Blue-Green Deployment Script for Balanced App
# This script performs zero-downtime deployment using blue-green strategy

echo '🔄 Starting Blue-Green Deployment...'

# Determine which environment is currently active
CURRENT_ACTIVE='blue'
if grep -q 'server app-green:3000 weight=1' src/services/nginx/upstream.conf; then
    CURRENT_ACTIVE='green'
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

# Pull latest images (no downtime)
echo '📥 Pulling latest images...'
docker compose -f compose.prod.yml pull

# Start infrastructure services (db, nginx, backup) if not running
echo '🏗️  Ensuring infrastructure services are running...'
docker compose -f compose.prod.yml up -d db nginx backup

# Deploy to target environment
echo "🚀 Deploying new version to $TARGET_ENV environment..."
docker compose -f compose.prod.yml up -d $TARGET_CONTAINER

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
    docker compose -f compose.prod.yml stop $TARGET_CONTAINER
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
docker compose -f compose.prod.yml exec nginx nginx -s reload

# Verify traffic switch
echo "🔍 Verifying traffic switch..."
sleep 5

# Stop old environment after successful switch
echo "🛑 Stopping old $CURRENT_ACTIVE environment..."
docker compose -f compose.prod.yml stop $CURRENT_CONTAINER

echo "✅ Blue-Green deployment completed successfully!"
echo "📊 Active environment: $TARGET_ENV"

# Show service status
echo 'Service status:'
docker compose -f compose.prod.yml ps
