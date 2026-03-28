const prisma = require("../../services/prisma");

async function ensureGuild(guild) {
  return prisma.guild.upsert({
    where: { id: guild.id },
    update: {
      name: guild.name
    },
    create: {
      id: guild.id,
      name: guild.name
    }
  });
}

async function ensureGuildSettings(guild) {
  await ensureGuild(guild);

  return prisma.guildSettings.upsert({
    where: { guildId: guild.id },
    update: {},
    create: { guildId: guild.id }
  });
}

async function setAdminRole(guild, roleId) {
  await ensureGuildSettings(guild);

  return prisma.guildSettings.update({
    where: { guildId: guild.id },
    data: {
      adminRoleId: roleId
    }
  });
}

async function clearAdminRole(guild) {
  await ensureGuildSettings(guild);

  return prisma.guildSettings.update({
    where: { guildId: guild.id },
    data: {
      adminRoleId: null
    }
  });
}

async function getConfig(guild) {
  return ensureGuildSettings(guild);
}

module.exports = {
  ensureGuild,
  ensureGuildSettings,
  setAdminRole,
  clearAdminRole,
  getConfig
};