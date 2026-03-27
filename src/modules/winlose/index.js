const { SlashCommandBuilder } = require("discord.js");
const service = require("./service");
const { buildWinloseMessage } = require("./view");

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
          const activeProfile = await app.services.profiles.getActiveProfile(interaction.guildId);

          if (!activeProfile) {
            await interaction.reply({
              content: "ยังไม่มี active profile กรุณาใช้ /profile set ก่อน",
              ephemeral: true
            });
            return;
          }

          const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);
          const payload = buildWinloseMessage(activeProfile);

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
        await interaction.update(buildWinloseMessage(refreshed));
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
        await interaction.update(buildWinloseMessage(refreshed));
      }
    },
    {
      id: "wl_reset",
      async execute(interaction, app) {
        const activeProfile = await app.services.profiles.getActiveProfile(interaction.guildId);
        if (!activeProfile) {
          await interaction.reply({ content: "ยังไม่มี active profile", ephemeral: true });
          return;
        }

        await service.reset(activeProfile.id);
        const refreshed = await app.services.profiles.getActiveProfile(interaction.guildId);
        await interaction.update(buildWinloseMessage(refreshed));
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

        await interaction.update(buildWinloseMessage(refreshed));
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

        await interaction.update(buildWinloseMessage(refreshed));
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

        await interaction.update(buildWinloseMessage(nextProfile));
    }
    }
  ],

  init(app) {
    app.logger.info("winlose module initialized");
  }
};