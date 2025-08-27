#!/bin/sh
set -e

# Backup service initialization script
# Sets up cron job and starts the backup service

echo "🔄 Initializing backup service..."

# Install cron daemon
apk add --no-cache dcron

# Create backup directory
mkdir -p /backups

# Make backup script executable
chmod +x /app/scripts/backup.sh

# Create log directory and file
mkdir -p /var/log
touch /var/log/backup.log

# Add cron job for daily backup at 2 AM
echo "0 2 * * * /app/scripts/backup.sh" | crontab -

echo "✅ Backup service configured - daily backups at 2 AM"

# Run initial backup
echo "🚀 Running initial backup..."
/app/scripts/backup.sh

# Start cron daemon in foreground
echo "📅 Starting cron daemon..."
exec crond -f -l 2
