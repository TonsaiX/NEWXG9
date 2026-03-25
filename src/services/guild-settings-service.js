const prisma = require("./prisma");

async function ensureGuildSettings(guildId) {
  return prisma.guildSettings.upsert({
    where: { guildId },
    update: {},
    create: { guildId }
  });
}

async function getGuildSettings(guildId) {
  return ensureGuildSettings(guildId);
}

async function setWinlosePanel(guildId, channelId, messageId) {
  return prisma.guildSettings.upsert({
    where: { guildId },
    update: {
      winloseChannelId: channelId,
      winloseMessageId: messageId
    },
    create: {
      guildId,
      winloseChannelId: channelId,
      winloseMessageId: messageId
    }
  });
}

module.exports = {
  ensureGuildSettings,
  getGuildSettings,
  setWinlosePanel
};