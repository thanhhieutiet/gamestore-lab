#!/bin/sh
# GameLab Backup Job - svc_backup
# Runs inside the backend container, pushes backup log to Windows AD share
# -------------------------------------------------------------------

TIMESTAMP=$(date +%Y-%m-%d)
BACKUP_FILE="app_backup_${TIMESTAMP}.log"

echo "[$(date -Iseconds)] GameLab Backup Job Started" > /tmp/$BACKUP_FILE
echo "=== Nginx logs ===" >> /tmp/$BACKUP_FILE
ls -la /app/logs/ 2>/dev/null >> /tmp/$BACKUP_FILE
echo "=== Node process ===" >> /tmp/$BACKUP_FILE
ps aux 2>/dev/null | head -5 >> /tmp/$BACKUP_FILE
echo "[$(date -Iseconds)] Backup collection completed" >> /tmp/$BACKUP_FILE

# Upload to Windows SMB share using svc_backup domain account
smbclient //20.20.20.10/AppBackup \
  -U 'THANHHIEUTIET\svc_backup%GameLab@backup' \
  -m SMB3 \
  -c "put /tmp/${BACKUP_FILE} ${BACKUP_FILE}; exit"

echo "Done: \\\\20.20.20.10\\AppBackup\\${BACKUP_FILE}"
