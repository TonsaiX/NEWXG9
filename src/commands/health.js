const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("health")
    .setDescription("เช็คสถานะระบบ"),

  async execute(interaction) {
    await interaction.reply("Bot is healthy");
  }
};