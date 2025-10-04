#!/bin/sh
set -e

# Database backup script for Balanced app
# Creates timestamped SQL dumps and cleans up old backups

BACKUP_DIR="/backups"
BACKUP_FILE="$BACKUP_DIR/balanced_backup_$(date +%Y%m%d_%H%M%S).sql"
LOG_FILE="/var/log/backup.log"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Log start
echo "$(date): Starting backup to $BACKUP_FILE" | tee -a "$LOG_FILE"

# Create database backup
PGPASSWORD="$DB_PASSWORD" pg_dump -h db -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"

# Verify backup was created
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "$(date): Backup completed successfully: $BACKUP_FILE ($BACKUP_SIZE)" | tee -a "$LOG_FILE"
else
    echo "$(date): ERROR: Backup failed - file not created" | tee -a "$LOG_FILE"
    exit 1
fi

# Clean up old backups (keep last 7 days)
DELETED_COUNT=$(find "$BACKUP_DIR" -name "balanced_backup_*.sql" -mtime +7 -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    echo "$(date): Cleaned up $DELETED_COUNT old backup(s)" | tee -a "$LOG_FILE"
else
    echo "$(date): No old backups to clean up" | tee -a "$LOG_FILE"
fi

echo "$(date): Backup process completed" | tee -a "$LOG_FILE"
