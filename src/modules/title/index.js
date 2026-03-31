const { SlashCommandBuilder } = require("discord.js");
const { requireManageBot } = require("../../utils/interaction");
const { buildTitleMessage, buildTitleModal } = require("./view");

module.exports = {
  name: "title",

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName("title")
        .setDescription("จัดการข้อความ overlay บนหน้าสตรีม")
        .addSubcommand(sub =>
          sub
            .setName("setup")
            .setDescription("สร้างหรืออัปเดต title controller panel")
        )
        .addSubcommand(sub =>
          sub
            .setName("url")
            .setDescription("แสดงลิงก์ title overlay")
        ),

      async execute(interaction, app) {
        const sub = interaction.options.getSubcommand();

        if (sub === "url") {
          const baseUrl = app.env.publicBaseUrl;

          if (!baseUrl) {
            await interaction.reply({
              content: "ยังไม่ได้ตั้งค่า PUBLIC_BASE_URL ใน .env",
              ephemeral: true
            });
            return;
          }

          await interaction.reply({
            content: `ลิงก์ Title Overlay:\n${baseUrl}/title-ui/${interaction.guildId}`,
            ephemeral: true
          });
          return;
        }

        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์จัดการ title overlay"))) {
          return;
        }

        if (sub === "setup") {
          const settings = await app.services.guildSettings.getGuildSettings(
            interaction.guildId,
            interaction.guild.name
          );

          const payload = buildTitleMessage(settings);

          let existingMessage = null;

          if (settings.titleChannelId && settings.titleMessageId) {
            try {
              const channel = await interaction.guild.channels.fetch(settings.titleChannelId);
              existingMessage = await channel.messages.fetch(settings.titleMessageId);
            } catch {
              existingMessage = null;
            }
          }

          if (existingMessage) {
            await existingMessage.edit(payload);
            await interaction.reply({
              content: "อัปเดต title controller เดิมแล้ว",
              ephemeral: true
            });
            return;
          }

          const sent = await interaction.channel.send(payload);

          await app.services.guildSettings.setTitlePanel(
            interaction.guildId,
            interaction.guild.name,
            interaction.channelId,
            sent.id
          );

          await interaction.reply({
            content: "สร้าง title controller แล้ว",
            ephemeral: true
          });
        }
      }
    }
  ],

  components: [
    {
      id: "title_add",
      async execute(interaction, app) {
        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์แก้ข้อความ title"))) {
          return;
        }

        const settings = await app.services.guildSettings.getGuildSettings(
          interaction.guildId,
          interaction.guild.name
        );

        await interaction.showModal(buildTitleModal(settings.titleText || "NEWXG9 STREAM"));
      }
    },
    {
      id: "title_direction",
      async execute(interaction, app) {
        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์เปลี่ยนทิศทาง title"))) {
          return;
        }

        const settings = await app.services.guildSettings.cycleTitleDirection(
          interaction.guildId,
          interaction.guild.name
        );

        if (settings.titleChannelId && settings.titleMessageId) {
          try {
            const channel = await interaction.guild.channels.fetch(settings.titleChannelId);
            const message = await channel.messages.fetch(settings.titleMessageId);
            await message.edit(buildTitleMessage(settings));
          } catch (error) {
            app.logger.warn("Could not update title panel after direction change");
            app.logger.warn(error);
          }
        }

        await interaction.update(buildTitleMessage(settings));
      }
    },
    {
      id: "title_add_modal",
      async execute(interaction, app) {
        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์แก้ข้อความ title"))) {
          return;
        }

        const text = interaction.fields.getTextInputValue("title_text");
        const settings = await app.services.guildSettings.setTitleText(
          interaction.guildId,
          interaction.guild.name,
          text
        );

        if (settings.titleChannelId && settings.titleMessageId) {
          try {
            const channel = await interaction.guild.channels.fetch(settings.titleChannelId);
            const message = await channel.messages.fetch(settings.titleMessageId);
            await message.edit(buildTitleMessage(settings));
          } catch (error) {
            app.logger.warn("Could not update title panel after text change");
            app.logger.warn(error);
          }
        }

        await interaction.reply({
          content: `อัปเดต title เป็น: ${settings.titleText}`,
          ephemeral: true
        });
      }
    }
  ],

  init(app) {
    app.logger.info("title module initialized");
  }
};