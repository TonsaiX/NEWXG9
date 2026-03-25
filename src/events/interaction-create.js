const { routeComponent } = require("../core/component-router");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client, app) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        await command.execute(interaction, app);
        return;
      }

      if (
        interaction.isButton() ||
        interaction.isStringSelectMenu() ||
        interaction.isModalSubmit()
      ) {
        const handled = await routeComponent(interaction, client, app);

        if (!handled && !interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "ไม่พบ handler สำหรับ component นี้",
            ephemeral: true
          });
        }
      }
    } catch (error) {
      app.logger.error(error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "เกิดข้อผิดพลาดในระบบ",
          ephemeral: true
        });
      }
    }
  }
};