const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("เช็คว่าบอทยังทำงานอยู่ไหม"),

  async execute(interaction) {
    await interaction.reply("Pong!");
  }
};