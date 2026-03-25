const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("reload bot modules"),

  async execute(interaction) {
    await interaction.reply({
      content: "ระบบ reload ยังไม่เปิดใช้ตอนนี้",
      ephemeral: true
    });
  }
};