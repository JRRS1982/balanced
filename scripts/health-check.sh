#!/bin/bash
set -e

# Health Check Script for Balanced App
# Performs comprehensive health checks after deployment

echo 'SSH connection established, starting health check...'
echo 'Current working directory:' $(pwd)
echo 'Current user:' $(whoami)
echo 'Timestamp:' $(date)
echo '--- Starting Docker Compose health verification ---'

# Check Docker Compose version and set command
if command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
    echo "📦 Using docker-compose (legacy)"
elif docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
    echo "📦 Using docker compose (modern)"
else
    echo "❌ Error: Neither 'docker compose' nor 'docker-compose' is available"
    exit 1
fi

# Check if all services are running
echo 'Checking Docker Compose service status...'
$DOCKER_COMPOSE -f compose.prod.yml ps

# Wait for app service to be healthy
echo 'Waiting for app service to be ready...'
sleep 10

# Check if app container is running
APP_CONTAINER=$($DOCKER_COMPOSE -f compose.prod.yml ps -q app)
if [ -z "$APP_CONTAINER" ]; then
  echo 'ERROR: App service is not running'
  echo 'Service logs:'
  $DOCKER_COMPOSE -f compose.prod.yml logs app
  exit 1
fi

echo 'SUCCESS: App service is running'

# Health check using nginx proxy (port 80 - Cloudflare handles HTTPS)
echo 'Checking application health via nginx proxy...'
echo 'Expected health endpoint: http://localhost/api/health'

HEALTH_CHECK_PASSED=false

# Use simple for loop with range to avoid any command substitution issues
for attempt in 1 2 3 4 5 6 7 8 9 10 11 12; do
  echo ""
  echo "=== Health check attempt $attempt/12 ==="

  # Use curl to get health status via nginx proxy
  echo "Attempting to connect to: http://localhost/api/health"

  # Save curl output to file to avoid command substitution syntax issues
  curl -s --connect-timeout 5 --max-time 10 http://localhost/api/health > /tmp/health_response 2>&1
  CURL_EXIT_CODE=$?

  # Read response from file instead of using command substitution
  if [ -f /tmp/health_response ]; then
    echo 'Curl response:'
    cat /tmp/health_response
  else
    echo 'Curl response: no response file'
  fi

  # Get HTTP status code using a different approach to avoid shell syntax issues
  # Use curl's exit code and response to determine status instead of format strings
  if curl -s --connect-timeout 5 --max-time 10 http://localhost/api/health >/dev/null 2>&1; then
    HTTP_CODE='200'
  else
    HTTP_CODE='000'
  fi

  echo "Curl exit code: $CURL_EXIT_CODE"
  echo "HTTP status code: $HTTP_CODE"

  # Decode curl exit codes for better debugging
  if [ $CURL_EXIT_CODE -eq 0 ]; then
    echo "Curl status: Success"
  elif [ $CURL_EXIT_CODE -eq 7 ]; then
    echo "Curl status: Failed to connect to host"
  elif [ $CURL_EXIT_CODE -eq 28 ]; then
    echo "Curl status: Operation timeout"
  elif [ $CURL_EXIT_CODE -eq 52 ]; then
    echo "Curl status: Empty reply from server"
  elif [ $CURL_EXIT_CODE -eq 56 ]; then
    echo "Curl status: Failure in receiving network data"
  else
    echo "Curl status: Unknown error (code $CURL_EXIT_CODE)"
  fi

  if [ $CURL_EXIT_CODE -eq 0 ] && grep -q '"status":"ok"' /tmp/health_response 2>/dev/null; then
    echo 'SUCCESS: Health check passed!'
    HEALTH_CHECK_PASSED=true
    break
  else
    echo "Health check failed (curl exit code: $CURL_EXIT_CODE), waiting 10 seconds..."

    # Show detailed diagnostics every few attempts
    # Show diagnostics every 3rd attempt (3, 6, 9, 12)
    SHOW_DIAGNOSTICS=false
    if [ $attempt -eq 3 ]; then SHOW_DIAGNOSTICS=true; fi
    if [ $attempt -eq 6 ]; then SHOW_DIAGNOSTICS=true; fi
    if [ $attempt -eq 9 ]; then SHOW_DIAGNOSTICS=true; fi
    if [ $attempt -eq 12 ]; then SHOW_DIAGNOSTICS=true; fi
    if [ "$SHOW_DIAGNOSTICS" = "true" ]; then
      echo ""
      echo '--- Diagnostic Information ---'
      echo 'Docker Compose service status:'
      $DOCKER_COMPOSE -f compose.prod.yml ps

      echo 'Port status:'
      netstat -tlnp | grep :80 || echo "Port 80 is not listening"
      netstat -tlnp | grep :8080 || echo "Port 8080 (health check) is not listening"

      echo 'Recent app service logs (last 10 lines):'
      $DOCKER_COMPOSE -f compose.prod.yml logs --tail=10 app

      echo 'Service resource usage:'
      docker stats --no-stream 2>/dev/null | head -5 || echo 'Stats unavailable'
      echo '--- End Diagnostics ---'
      echo ""
    fi

    sleep 10
  fi
done

# Final result
if [ "$HEALTH_CHECK_PASSED" = "true" ]; then
  echo 'SUCCESS: Application is healthy and ready!'
  echo 'Final service status:'
  $DOCKER_COMPOSE -f compose.prod.yml ps
  exit 0
else
  echo ""
  echo 'ERROR: Health check failed after 2 minutes'
  echo ""
  echo '=== FAILURE DIAGNOSTICS ==='

  echo 'Docker Compose service status:'
  $DOCKER_COMPOSE -f compose.prod.yml ps

  echo ""
  echo 'App service logs:'
  $DOCKER_COMPOSE -f compose.prod.yml logs app

  echo ""
  echo 'Database service logs:'
  $DOCKER_COMPOSE -f compose.prod.yml logs db

  echo ""
  echo 'Nginx service logs:'
  $DOCKER_COMPOSE -f compose.prod.yml logs nginx

  echo ""
  echo 'System port status:'
  netstat -tlnp | grep :80 || echo "Port 80 is not listening"
  netstat -tlnp | grep :8080 || echo "Port 8080 (health check) is not listening"

  echo '=== END DIAGNOSTICS ==='
  echo ""

  echo 'Health check failed after all attempts'
  exit 1
fi
