 #!/usr/bin/env bash
 set -euo pipefail

BACKUP_DIR="/backups/media-server"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

create_backup() {
  echo "Creating backup at $BACKUP_DIR/backup_$DATE"
  mkdir -p "$BACKUP_DIR/backup_$DATE"

  # Backup configurations
  docker run --rm \
    -v /opt/media-server/config:/source:ro \
    -v "$BACKUP_DIR/backup_$DATE":/backup \
    alpine tar czf /backup/config.tar.gz -C /source .

  # Backup Docker Compose files and environment
  cp -r compose/ "$BACKUP_DIR/backup_$DATE/"
  cp .env "$BACKUP_DIR/backup_$DATE/"

  # Backup database
  docker exec postgres pg_dump -U mediaserver mediaserver > "$BACKUP_DIR/backup_$DATE/database.sql"
}

cleanup_old_backups() {
  echo "Cleaning up backups older than $RETENTION_DAYS days"
  find "$BACKUP_DIR" -name "backup_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \
    \;
}

verify_backup() {
  echo "Verifying backup integrity"
  tar -tzf "$BACKUP_DIR/backup_$DATE/config.tar.gz" > /dev/null
  echo "Backup verified successfully"
}

main() {
  create_backup
  verify_backup
  cleanup_old_backups
  echo "Backup completed successfully"
}

main