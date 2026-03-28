const { SlashCommandBuilder } = require("discord.js");
const service = require("./service");
const { buildNewStarMessage, buildNewstarTemplateMenu } = require("./view");
const { requireManageBot } = require("../../utils/interaction");

const RANK_CHOICES = [
  "EPIC V",
  "EPIC IV",
  "EPIC III",
  "EPIC II",
  "EPIC I",
  "LEGEND V",
  "LEGEND IV",
  "LEGEND III",
  "LEGEND II",
  "LEGEND I",
  "เทพสงคราม"
];

module.exports = {
  name: "newstar",

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName("newstar")
        .setDescription("จัดการ rank star overlay")
        .addSubcommand(sub =>
          sub
            .setName("setup")
            .setDescription("สร้างหรืออัปเดต rank star panel")
        )
        .addSubcommand(sub =>
          sub
            .setName("url")
            .setDescription("แสดงลิงก์ overlay สำหรับหน้าสตรีม")
        )
        .addSubcommand(sub => {
          const cmd = sub
            .setName("set")
            .setDescription("ตั้ง rank ปัจจุบัน")
            .addStringOption(opt =>
              opt
                .setName("rank")
                .setDescription("แรงค์ปัจจุบัน")
                .setRequired(true)
            );

          for (const rank of RANK_CHOICES) {
            cmd.options[0].addChoices({ name: rank, value: rank });
          }

          return cmd;
        }),

      async execute(interaction, app) {
        const sub = interaction.options.getSubcommand();

        if (sub === "set") {
          if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์เปลี่ยน rank"))) {
            return;
          }

          const rank = interaction.options.getString("rank");
          const state = await service.setRank(interaction.guild, rank);
          const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);

          if (settings.newstarChannelId && settings.newstarMessageId) {
            try {
              const channel = await interaction.guild.channels.fetch(settings.newstarChannelId);
              const message = await channel.messages.fetch(settings.newstarMessageId);
              await message.edit(buildNewStarMessage(state, settings.newstarTemplate || "compact"));
            } catch (error) {
              app.logger.warn("Could not update existing newstar panel");
              app.logger.warn(error);
            }
          }

          await interaction.reply({
            content: `ตั้ง rank เป็น ${rank} แล้ว`,
            ephemeral: true
          });
          return;
        }

        if (sub === "setup") {
          if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์สร้างหรือแก้ไข rank star panel"))) {
            return;
          }

          const state = await service.getOrCreateState(interaction.guild);
          const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);
          const payload = buildNewStarMessage(
            state,
            settings.newstarTemplate || "compact"
          );

          let existingMessage = null;

          if (settings.newstarChannelId && settings.newstarMessageId) {
            try {
              const channel = await interaction.guild.channels.fetch(settings.newstarChannelId);
              existingMessage = await channel.messages.fetch(settings.newstarMessageId);
            } catch {
              existingMessage = null;
            }
          }

          if (existingMessage) {
            await existingMessage.edit(payload);
            await interaction.reply({
              content: "อัปเดต rank star panel เดิมแล้ว",
              ephemeral: true
            });
            return;
          }

          const sent = await interaction.channel.send(payload);

          await app.services.guildSettings.setNewstarPanel(
            interaction.guildId,
            interaction.channelId,
            sent.id
          );

          await interaction.reply({
            content: "สร้าง rank star panel แล้ว",
            ephemeral: true
          });
          return;
        }

        if (sub === "url") {
          const baseUrl = app.env.publicBaseUrl;

          if (!baseUrl) {
            await interaction.reply({
              content: "ยังไม่ได้ตั้งค่า PUBLIC_BASE_URL ใน .env",
              ephemeral: true
            });
            return;
          }

          const url = `${baseUrl}/newstar-ui/${interaction.guildId}`;

          await interaction.reply({
            content: `ลิงก์ New Star Overlay:\n${url}`,
            ephemeral: true
          });
        }
      }
    }
  ],

  components: [
    {
      id: "ns_add_star",
      async execute(interaction, app) {
        const state = await service.incrementStar(interaction.guild);
        const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);
        await interaction.update(buildNewStarMessage(state, settings.newstarTemplate || "compact"));
      }
    },
    {
      id: "ns_sub_star",
      async execute(interaction, app) {
        const state = await service.decrementStar(interaction.guild);
        const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);
        await interaction.update(buildNewStarMessage(state, settings.newstarTemplate || "compact"));
      }
    },
    {
      id: "ns_show_template_menu",
      async execute(interaction, app) {
        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์เปลี่ยน template"))) {
          return;
        }

        const currentTemplate = await app.services.guildSettings.getNewstarTemplate(interaction.guildId);
        await interaction.reply(buildNewstarTemplateMenu(currentTemplate));
      }
    },
    {
      id: "ns_select_template",
      async execute(interaction, app) {
        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์เปลี่ยน template"))) {
          return;
        }

        const selected = interaction.values?.[0] || "compact";
        const settings = await app.services.guildSettings.setNewstarTemplate(
          interaction.guildId,
          selected
        );

        const state = await service.getOrCreateState(interaction.guild);

        if (settings.newstarChannelId && settings.newstarMessageId) {
          try {
            const channel = await interaction.guild.channels.fetch(settings.newstarChannelId);
            const message = await channel.messages.fetch(settings.newstarMessageId);

            await message.edit(
              buildNewStarMessage(state, settings.newstarTemplate || "compact")
            );
          } catch (error) {
            app.logger.warn("Could not update newstar panel after template change");
            app.logger.warn(error);
          }
        }

        await interaction.update({
          content: `เปลี่ยน template newstar เป็น **${settings.newstarTemplate}** แล้ว`,
          components: []
        });
      }
    }
  ],

  init(app) {
    app.logger.info("newstar module initialized");
  }
};