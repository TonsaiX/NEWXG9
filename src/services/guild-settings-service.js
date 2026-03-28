const prisma = require("./prisma");

const WINLOSE_TEMPLATES = ["compact", "scorebar", "duel", "clean"];
const NEWSTAR_TEMPLATES = ["compact", "banner", "orb", "clean"];

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

async function setNewstarPanel(guildId, channelId, messageId) {
  return prisma.guildSettings.upsert({
    where: { guildId },
    update: {
      newstarChannelId: channelId,
      newstarMessageId: messageId
    },
    create: {
      guildId,
      newstarChannelId: channelId,
      newstarMessageId: messageId
    }
  });
}

function normalizeWinloseTemplate(template) {
  const value = String(template || "").trim().toLowerCase();
  return WINLOSE_TEMPLATES.includes(value) ? value : "compact";
}

function normalizeNewstarTemplate(template) {
  const value = String(template || "").trim().toLowerCase();
  return NEWSTAR_TEMPLATES.includes(value) ? value : "compact";
}

async function setWinloseTemplate(guildId, template) {
  const nextTemplate = normalizeWinloseTemplate(template);

  await ensureGuildSettings(guildId);

  return prisma.guildSettings.update({
    where: { guildId },
    data: {
      winloseTemplate: nextTemplate
    }
  });
}

async function getWinloseTemplate(guildId) {
  const settings = await ensureGuildSettings(guildId);
  return normalizeWinloseTemplate(settings.winloseTemplate);
}

async function setNewstarTemplate(guildId, template) {
  const nextTemplate = normalizeNewstarTemplate(template);

  await ensureGuildSettings(guildId);

  return prisma.guildSettings.update({
    where: { guildId },
    data: {
      newstarTemplate: nextTemplate
    }
  });
}

async function getNewstarTemplate(guildId) {
  const settings = await ensureGuildSettings(guildId);
  return normalizeNewstarTemplate(settings.newstarTemplate);
}

module.exports = {
  WINLOSE_TEMPLATES,
  NEWSTAR_TEMPLATES,
  ensureGuildSettings,
  getGuildSettings,
  setWinlosePanel,
  setNewstarPanel,
  setWinloseTemplate,
  getWinloseTemplate,
  setNewstarTemplate,
  getNewstarTemplate,
  normalizeWinloseTemplate,
  normalizeNewstarTemplate
};