const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

function formatRole(roleId) {
  return roleId ? `<@&${roleId}>` : "ยังไม่ได้ตั้งค่า";
}

function formatChannel(channelId) {
  return channelId ? `<#${channelId}>` : "ยังไม่ได้ตั้งค่า";
}

function formatMessageId(messageId) {
  return messageId || "ยังไม่ได้ตั้งค่า";
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("ตั้งค่าระบบบอท")
    .addSubcommand(sub =>
      sub
        .setName("admin-role")
        .setDescription("ตั้งค่า role สำหรับจัดการบอท")
        .addRoleOption(opt =>
          opt
            .setName("role")
            .setDescription("เลือก role ที่จะใช้เป็น admin")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("clear-admin-role")
        .setDescription("ลบ role admin ของบอท")
    )
    .addSubcommand(sub =>
      sub
        .setName("show")
        .setDescription("ดูการตั้งค่าปัจจุบันของบอท")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, app) {
    const sub = interaction.options.getSubcommand();

    if (sub === "admin-role") {
      const role = interaction.options.getRole("role");

      await app.services.admin.setAdminRole(interaction.guild, role.id);

      await interaction.reply({
        content: `ตั้งค่า admin role เป็น <@&${role.id}> เรียบร้อย`,
        ephemeral: true
      });
      return;
    }

    if (sub === "clear-admin-role") {
      await app.services.admin.clearAdminRole(interaction.guild);

      await interaction.reply({
        content: "ลบ admin role ของบอทแล้ว",
        ephemeral: true
      });
      return;
    }

    if (sub === "show") {
      const settings = await app.services.admin.getConfig(interaction.guild);

      await interaction.reply({
        content: [
          "📋 **Bot Configuration**",
          `**Admin Role:** ${formatRole(settings.adminRoleId)}`,
          "",
          "🎮 **Win/Lose Panel**",
          `**Channel:** ${formatChannel(settings.winloseChannelId)}`,
          `**Message ID:** ${formatMessageId(settings.winloseMessageId)}`,
          "",
          "🌟 **New Star Panel**",
          `**Channel:** ${formatChannel(settings.newstarChannelId)}`,
          `**Message ID:** ${formatMessageId(settings.newstarMessageId)}`
        ].join("\n"),
        ephemeral: true
      });
    }
  }
};