const { PermissionFlagsBits } = require("discord.js");

function isAdmin(member) {
  if (!member?.permissions) return false;
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

function hasRole(member, roleId) {
  if (!roleId) return false;
  return member.roles?.cache?.has(roleId) ?? false;
}

async function resolveMember(interaction) {
  if (interaction?.member?.roles?.cache) {
    return interaction.member;
  }

  if (!interaction?.guild || !interaction?.user?.id) {
    return null;
  }

  try {
    return await interaction.guild.members.fetch(interaction.user.id);
  } catch {
    return null;
  }
}

async function canManageBot(interaction, app) {
  const member = await resolveMember(interaction);
  if (!member) return false;

  if (isAdmin(member)) return true;

  const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);
  return hasRole(member, settings.adminRoleId);
}

module.exports = {
  isAdmin,
  hasRole,
  canManageBot
};