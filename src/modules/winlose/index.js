const { SlashCommandBuilder } = require("discord.js");
const service = require("./service");
const { buildWinloseMessage, buildWinloseTemplateMenu } = require("./view");
const { requireManageBot } = require("../../utils/interaction");

module.exports = {
  name: "winlose",

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName("winlose")
        .setDescription("เปิดหรืออัปเดตแผงควบคุม win/lose")
        .addSubcommand(sub =>
          sub
            .setName("setup")
            .setDescription("สร้างหรืออัปเดตแผงควบคุม win/lose")
        )
        .addSubcommand(sub =>
          sub
            .setName("url")
            .setDescription("แสดงลิงก์ overlay สำหรับหน้าสตรีม")
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

          const url = `${baseUrl}/overlay-ui/${interaction.guildId}`;

          await interaction.reply({
            content: `ลิงก์ Win/Lose Overlay:\n${url}`,
            ephemeral: true
          });
          return;
        }

        if (sub === "setup") {
          if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์สร้างหรือแก้ไข win/lose panel"))) {
            return;
          }

          const activeProfile = await app.services.profiles.getActiveProfile(interaction.guildId);

          if (!activeProfile) {
            await interaction.reply({
              content: "ยังไม่มี active profile กรุณาใช้ /profile set ก่อน",
              ephemeral: true
            });
            return;
          }

          const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);
          const payload = buildWinloseMessage(
            activeProfile,
            settings.winloseTemplate || "compact"
          );

          let existingMessage = null;

          if (settings.winloseChannelId && settings.winloseMessageId) {
            try {
              const channel = await interaction.guild.channels.fetch(settings.winloseChannelId);
              existingMessage = await channel.messages.fetch(settings.winloseMessageId);
            } catch {
              existingMessage = null;
            }
          }

          if (existingMessage) {
            await existingMessage.edit(payload);
            await interaction.reply({
              content: "อัปเดตแผง win/lose เดิมแล้ว",
              ephemeral: true
            });
            return;
          }

          const sent = await interaction.channel.send(payload);

          await app.services.guildSettings.setWinlosePanel(
            interaction.guildId,
            interaction.channelId,
            sent.id
          );

          await interaction.reply({
            content: "สร้างแผง win/lose แล้ว",
            ephemeral: true
          });
        }
      }
    }
  ],

  components: [
    {
      id: "wl_add_win",
      async execute(interaction, app) {
        const activeProfile = await app.services.profiles.getActiveProfile(interaction.guildId);
        if (!activeProfile) {
          await interaction.reply({ content: "ยังไม่มี active profile", ephemeral: true });
          return;
        }

        await service.incrementWin(activeProfile.id);
        const refreshed = await app.services.profiles.getActiveProfile(interaction.guildId);
        const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);

        await interaction.update(buildWinloseMessage(refreshed, settings.winloseTemplate || "compact"));
      }
    },
    {
      id: "wl_add_loss",
      async execute(interaction, app) {
        const activeProfile = await app.services.profiles.getActiveProfile(interaction.guildId);
        if (!activeProfile) {
          await interaction.reply({ content: "ยังไม่มี active profile", ephemeral: true });
          return;
        }

        await service.incrementLoss(activeProfile.id);
        const refreshed = await app.services.profiles.getActiveProfile(interaction.guildId);
        const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);

        await interaction.update(buildWinloseMessage(refreshed, settings.winloseTemplate || "compact"));
      }
    },
    {
      id: "wl_reset",
      async execute(interaction, app) {
        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์รีเซ็ตข้อมูล"))) {
          return;
        }

        const activeProfile = await app.services.profiles.getActiveProfile(interaction.guildId);
        if (!activeProfile) {
          await interaction.reply({ content: "ยังไม่มี active profile", ephemeral: true });
          return;
        }

        await service.reset(activeProfile.id);
        const refreshed = await app.services.profiles.getActiveProfile(interaction.guildId);
        const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);

        await interaction.update(buildWinloseMessage(refreshed, settings.winloseTemplate || "compact"));
      }
    },
    {
      id: "wl_sub_win",
      async execute(interaction, app) {
        const activeProfile = await app.services.profiles.getActiveProfile(interaction.guildId);

        if (!activeProfile) {
          await interaction.reply({ content: "ยังไม่มี active profile", ephemeral: true });
          return;
        }

        await service.decrementWin(activeProfile.id);
        const refreshed = await app.services.profiles.getActiveProfile(interaction.guildId);
        const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);

        await interaction.update(buildWinloseMessage(refreshed, settings.winloseTemplate || "compact"));
      }
    },
    {
      id: "wl_sub_loss",
      async execute(interaction, app) {
        const activeProfile = await app.services.profiles.getActiveProfile(interaction.guildId);

        if (!activeProfile) {
          await interaction.reply({ content: "ยังไม่มี active profile", ephemeral: true });
          return;
        }

        await service.decrementLoss(activeProfile.id);
        const refreshed = await app.services.profiles.getActiveProfile(interaction.guildId);
        const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);

        await interaction.update(buildWinloseMessage(refreshed, settings.winloseTemplate || "compact"));
      }
    },
    {
      id: "wl_cycle_profile",
      async execute(interaction, app) {
        const nextProfile = await app.services.profiles.cycleActiveProfile(interaction.guildId);

        if (!nextProfile) {
          await interaction.reply({
            content: "ยังไม่มีโปรไฟล์ให้สลับ",
            ephemeral: true
          });
          return;
        }

        const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);
        await interaction.update(buildWinloseMessage(nextProfile, settings.winloseTemplate || "compact"));
      }
    },
    {
      id: "wl_show_template_menu",
      async execute(interaction, app) {
        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์เปลี่ยน template"))) {
          return;
        }

        const currentTemplate = await app.services.guildSettings.getWinloseTemplate(interaction.guildId);
        await interaction.reply(buildWinloseTemplateMenu(currentTemplate));
      }
    },
    {
      id: "wl_select_template",
      async execute(interaction, app) {
        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์เปลี่ยน template"))) {
          return;
        }

        const selected = interaction.values?.[0] || "compact";
        const settings = await app.services.guildSettings.setWinloseTemplate(
          interaction.guildId,
          selected
        );

        const activeProfile = await app.services.profiles.getActiveProfile(interaction.guildId);

        if (settings.winloseChannelId && settings.winloseMessageId) {
          try {
            const channel = await interaction.guild.channels.fetch(settings.winloseChannelId);
            const message = await channel.messages.fetch(settings.winloseMessageId);

            await message.edit(
              buildWinloseMessage(activeProfile, settings.winloseTemplate || "compact")
            );
          } catch (error) {
            app.logger.warn("Could not update winlose panel after template change");
            app.logger.warn(error);
          }
        }

        await interaction.update({
          content: `เปลี่ยน template win/lose เป็น **${settings.winloseTemplate}** แล้ว`,
          components: []
        });
      }
    }
  ],

  init(app) {
    app.logger.info("winlose module initialized");
  }
};