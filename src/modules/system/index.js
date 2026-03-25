const { SlashCommandBuilder } = require("discord.js");
const { buildWinloseMessage } = require("../winlose/view");

module.exports = {
  name: "system",

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("จัดการโปรไฟล์")
        .addSubcommand(sub =>
          sub
            .setName("create")
            .setDescription("สร้างโปรไฟล์ใหม่")
            .addStringOption(opt =>
              opt.setName("name").setDescription("ชื่อโปรไฟล์").setRequired(true)
            )
        )
        .addSubcommand(sub =>
          sub
            .setName("list")
            .setDescription("ดูรายการโปรไฟล์")
        )
        .addSubcommand(sub =>
          sub
            .setName("set")
            .setDescription("ตั้งค่าโปรไฟล์ที่ใช้งาน")
            .addStringOption(opt =>
              opt.setName("name").setDescription("ชื่อโปรไฟล์").setRequired(true)
            )
        )
        .addSubcommand(sub =>
        sub
            .setName("delete")
            .setDescription("ลบโปรไฟล์")
            .addStringOption(opt =>
            opt.setName("name").setDescription("ชื่อโปรไฟล์").setRequired(true)
            )
        ),

      async execute(interaction, app) {
        const sub = interaction.options.getSubcommand();

        if (sub === "create") {
          const name = interaction.options.getString("name");
          const profile = await app.services.profiles.createProfile(interaction.guild, name);

          await interaction.reply(`สร้างโปรไฟล์ ${profile.name} เรียบร้อย`);
          return;
        }

        if (sub === "list") {
          const profiles = await app.services.profiles.listProfiles(interaction.guildId);

          if (!profiles.length) {
            await interaction.reply("ยังไม่มีโปรไฟล์");
            return;
          }

          const text = profiles
            .map(
              p => `- ${p.name} ${p.isActive ? "(active)" : ""} | W:${p.overlayState?.wins ?? 0} L:${p.overlayState?.losses ?? 0}`
            )
            .join("\n");

          await interaction.reply(text);
          return;
        }

        if (sub === "set") {
          const name = interaction.options.getString("name");
          const profiles = await app.services.profiles.listProfiles(interaction.guildId);
          const profile = profiles.find(p => p.name.toLowerCase() === name.toLowerCase());

          if (!profile) {
            await interaction.reply({
              content: `ไม่พบโปรไฟล์ชื่อ ${name}`,
              ephemeral: true
            });
            return;
          }

          // เปลี่ยน active profile
          await app.services.profiles.setActiveProfile(interaction.guildId, profile.id);

          // โหลด active profile ใหม่
          const activeProfile = await app.services.profiles.getActiveProfile(interaction.guildId);

          // อัปเดต embed เดิมทันที ถ้ามี
          const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);

          if (settings.winloseChannelId && settings.winloseMessageId) {
            try {
              const channel = await interaction.guild.channels.fetch(settings.winloseChannelId);
              const message = await channel.messages.fetch(settings.winloseMessageId);

              await message.edit(buildWinloseMessage(activeProfile));
            } catch (error) {
              app.logger.warn("Could not update existing winlose panel after profile switch");
              app.logger.warn(error);
            }
          }

          await interaction.reply(`ตั้ง ${activeProfile.name} เป็น active profile แล้ว`);
        }
        
        if (sub === "delete") {
        const name = interaction.options.getString("name");

        const profiles = await app.services.profiles.listProfiles(interaction.guildId);
        const profile = profiles.find(p => p.name.toLowerCase() === name.toLowerCase());

        if (!profile) {
            await interaction.reply({
            content: `ไม่พบโปรไฟล์ชื่อ ${name}`,
            ephemeral: true
            });
            return;
        }

        // ลบ profile
        await app.services.profiles.deleteProfile(profile.id);

        // หา profile ใหม่ให้ active (ถ้ามี)
        const remaining = await app.services.profiles.listProfiles(interaction.guildId);

        let newActive = null;

        if (remaining.length > 0) {
            newActive = remaining[0];
            await app.services.profiles.setActiveProfile(interaction.guildId, newActive.id);
        }

        // อัปเดต winlose panel
        const settings = await app.services.guildSettings.getGuildSettings(interaction.guildId);

        if (settings.winloseChannelId && settings.winloseMessageId) {
            try {
            const channel = await interaction.guild.channels.fetch(settings.winloseChannelId);
            const message = await channel.messages.fetch(settings.winloseMessageId);

            const { buildWinloseMessage } = require("../winlose/view");

            if (newActive) {
                const refreshed = await app.services.profiles.getActiveProfile(interaction.guildId);
                await message.edit(buildWinloseMessage(refreshed));
            } else {
                await message.edit({
                content: "ไม่มีโปรไฟล์แล้ว",
                embeds: [],
                components: []
                });
            }
            } catch (err) {
            app.logger.warn("Failed to update panel after delete");
            }
        }

        await interaction.reply(
            newActive
            ? `ลบ ${profile.name} แล้ว → เปลี่ยนเป็น ${newActive.name}`
            : `ลบ ${profile.name} แล้ว (ไม่มีโปรไฟล์เหลือ)`
        );
        }
      }
    }
  ],

  components: [],
  init(app) {
    app.logger.info("system module initialized");
  }
};