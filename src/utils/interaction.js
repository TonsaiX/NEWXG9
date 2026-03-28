async function requireManageBot(interaction, app, message = "คุณไม่มีสิทธิ์ใช้คำสั่งนี้") {
  const allowed = await app.services.permissions.canManageBot(interaction, app);

  if (allowed) return true;

  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content: message,
      ephemeral: true
    });
  }

  return false;
}

module.exports = {
  requireManageBot
};