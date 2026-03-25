const env = require("./config/env");
const logger = require("./core/logger");
const prisma = require("./services/prisma");

const guildSettingsService = require("./services/guild-settings-service");
const profileService = require("./services/profile-service");
const permissionService = require("./services/permission-service");
const auditLogService = require("./services/audit-log-service");

function createApp(client) {
  return {
    env,
    logger,
    prisma,
    client,
    services: {
      guildSettings: guildSettingsService,
      profiles: profileService,
      permissions: permissionService,
      auditLogs: auditLogService
    }
  };
}

module.exports = { createApp };