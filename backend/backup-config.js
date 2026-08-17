// backup-config.js
// GameLab Backup Configuration
// Scheduled: daily at 02:00 UTC

module.exports = {
  backup: {
    enabled: true,
    schedule: "0 2 * * *",
    target: {
      server: "20.20.20.10",
      share: "AppBackup",
      domain: "THANHHIEUTIET",
      username: "svc_backup",
      password: "GameLab@backup",
    },
    include: ["./db/exports", "./backend/logs", "./nginx/logs"],
  },
};
