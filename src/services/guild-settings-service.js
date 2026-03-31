const prisma = require("./prisma");

const WINLOSE_TEMPLATES = ["compact", "scorebar", "duel", "clean"];
const NEWSTAR_TEMPLATES = ["compact", "banner", "orb", "clean"];
const TITLE_DIRECTIONS = ["left-to-right", "right-to-left", "center"];

async function ensureGuildRecord(guildId, guildName = null) {
  return prisma.guild.upsert({
    where: { id: guildId },
    update: { name: guildName ?? undefined },
    create: {
      id: guildId,
      name: guildName
    }
  });
}

async function ensureGuildSettings(guildId, guildName = null) {
  await ensureGuildRecord(guildId, guildName);

  return prisma.guildSettings.upsert({
    where: { guildId },
    update: {},
    create: { guildId }
  });
}

async function getGuildSettings(guildId, guildName = null) {
  return ensureGuildSettings(guildId, guildName);
}

async function setWinlosePanel(guildId, channelId, messageId) {
  await ensureGuildSettings(guildId);

  return prisma.guildSettings.update({
    where: { guildId },
    data: {
      winloseChannelId: channelId,
      winloseMessageId: messageId
    }
  });
}

async function setNewstarPanel(guildId, channelId, messageId) {
  await ensureGuildSettings(guildId);

  return prisma.guildSettings.update({
    where: { guildId },
    data: {
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

function normalizeVerifyRoles(roleIds) {
  return [...new Set(
    (roleIds || [])
      .filter(Boolean)
      .map(id => String(id).trim())
      .filter(Boolean)
  )];
}

async function setVerifyPanel(guildId, guildName, verifyChannelId, verifyMessageId, verifyStaffChannelId, minAccountAgeDays) {
  await ensureGuildSettings(guildId, guildName);

  return prisma.guildSettings.update({
    where: { guildId },
    data: {
      verifyChannelId,
      verifyMessageId,
      verifyStaffChannelId,
      verifyMinAccountAgeDays: minAccountAgeDays
    }
  });
}

async function setVerifyRoles(guildId, guildName, roleIds) {
  await ensureGuildSettings(guildId, guildName);

  return prisma.guildSettings.update({
    where: { guildId },
    data: {
      verifyRoleIds: normalizeVerifyRoles(roleIds)
    }
  });
}

async function getVerifyRoles(guildId) {
  const settings = await ensureGuildSettings(guildId);
  return normalizeVerifyRoles(settings.verifyRoleIds);
}

function normalizeTitleDirection(direction) {
  const value = String(direction || "").trim().toLowerCase();
  return TITLE_DIRECTIONS.includes(value) ? value : "right-to-left";
}

async function setTitlePanel(guildId, guildName, channelId, messageId) {
  await ensureGuildSettings(guildId, guildName);

  return prisma.guildSettings.update({
    where: { guildId },
    data: {
      titleChannelId: channelId,
      titleMessageId: messageId
    }
  });
}

async function setTitleText(guildId, guildName, text) {
  await ensureGuildSettings(guildId, guildName);

  return prisma.guildSettings.update({
    where: { guildId },
    data: {
      titleText: String(text || "").trim().slice(0, 120) || "NEWXG9 STREAM"
    }
  });
}

async function setTitleDirection(guildId, guildName, direction) {
  await ensureGuildSettings(guildId, guildName);

  return prisma.guildSettings.update({
    where: { guildId },
    data: {
      titleDirection: normalizeTitleDirection(direction)
    }
  });
}

async function cycleTitleDirection(guildId, guildName) {
  const settings = await ensureGuildSettings(guildId, guildName);
  const current = normalizeTitleDirection(settings.titleDirection);
  const idx = TITLE_DIRECTIONS.indexOf(current);
  const next = TITLE_DIRECTIONS[(idx + 1) % TITLE_DIRECTIONS.length];

  return prisma.guildSettings.update({
    where: { guildId },
    data: {
      titleDirection: next
    }
  });
}

module.exports = {
  WINLOSE_TEMPLATES,
  NEWSTAR_TEMPLATES,
  TITLE_DIRECTIONS,
  ensureGuildRecord,
  ensureGuildSettings,
  getGuildSettings,
  setWinlosePanel,
  setNewstarPanel,
  setWinloseTemplate,
  getWinloseTemplate,
  setNewstarTemplate,
  getNewstarTemplate,
  setVerifyPanel,
  setVerifyRoles,
  getVerifyRoles,
  setTitlePanel,
  setTitleText,
  setTitleDirection,
  cycleTitleDirection,
  normalizeTitleDirection,
  normalizeWinloseTemplate,
  normalizeNewstarTemplate,
  normalizeVerifyRoles
};