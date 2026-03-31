const {
  SlashCommandBuilder,
  ChannelType
} = require("discord.js");
const { requireManageBot } = require("../../utils/interaction");
const verifyService = require("./service");
const {
  buildVerifyPanel,
  buildStaffReviewMessage,
  buildResolvedStaffMessage
} = require("./view");

module.exports = {
  name: "verify",

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("จัดการระบบ verify")
        .addSubcommand(sub =>
          sub
            .setName("setup")
            .setDescription("สร้างหรืออัปเดต verify panel")
            .addChannelOption(opt =>
              opt
                .setName("staff_channel")
                .setDescription("ช่องสำหรับส่งแจ้งเตือนให้ทีมงานอนุมัติ")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
            .addIntegerOption(opt =>
              opt
                .setName("min_days")
                .setDescription("อายุบัญชีขั้นต่ำ (วัน) ก่อน auto verify")
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(3650)
            )
        )
        .addSubcommand(sub =>
          sub
            .setName("setrole")
            .setDescription("ตั้ง role ที่จะได้รับหลัง verify")
            .addRoleOption(opt => opt.setName("role1").setDescription("Role 1").setRequired(true))
            .addRoleOption(opt => opt.setName("role2").setDescription("Role 2").setRequired(false))
            .addRoleOption(opt => opt.setName("role3").setDescription("Role 3").setRequired(false))
            .addRoleOption(opt => opt.setName("role4").setDescription("Role 4").setRequired(false))
            .addRoleOption(opt => opt.setName("role5").setDescription("Role 5").setRequired(false))
            .addRoleOption(opt => opt.setName("role6").setDescription("Role 6").setRequired(false))
            .addRoleOption(opt => opt.setName("role7").setDescription("Role 7").setRequired(false))
            .addRoleOption(opt => opt.setName("role8").setDescription("Role 8").setRequired(false))
            .addRoleOption(opt => opt.setName("role9").setDescription("Role 9").setRequired(false))
            .addRoleOption(opt => opt.setName("role10").setDescription("Role 10").setRequired(false))
        )
        .addSubcommand(sub =>
          sub
            .setName("show")
            .setDescription("ดูการตั้งค่าระบบ verify")
        ),

      async execute(interaction, app) {
        const sub = interaction.options.getSubcommand();

        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์จัดการระบบ verify"))) {
          return;
        }

        if (sub === "setrole") {
          const roleIds = [
            interaction.options.getRole("role1")?.id,
            interaction.options.getRole("role2")?.id,
            interaction.options.getRole("role3")?.id,
            interaction.options.getRole("role4")?.id,
            interaction.options.getRole("role5")?.id,
            interaction.options.getRole("role6")?.id,
            interaction.options.getRole("role7")?.id,
            interaction.options.getRole("role8")?.id,
            interaction.options.getRole("role9")?.id,
            interaction.options.getRole("role10")?.id
          ].filter(Boolean);

          const settings = await app.services.guildSettings.setVerifyRoles(
            interaction.guildId,
            interaction.guild.name,
            roleIds
          );

          if (settings.verifyChannelId && settings.verifyMessageId) {
            try {
              const channel = await interaction.guild.channels.fetch(settings.verifyChannelId);
              const message = await channel.messages.fetch(settings.verifyMessageId);
              await message.edit(buildVerifyPanel(settings, roleIds));
            } catch (error) {
              app.logger.warn("Could not update verify panel after setrole");
              app.logger.warn(error);
            }
          }

          await interaction.reply({
            content: `ตั้ง role สำหรับ verify แล้ว ${roleIds.map(id => `<@&${id}>`).join(", ")}`,
            ephemeral: true
          });
          return;
        }

        if (sub === "setup") {
          const staffChannel = interaction.options.getChannel("staff_channel") || interaction.channel;
          const minDays = interaction.options.getInteger("min_days") ?? 30;

          const roleIds = await app.services.guildSettings.getVerifyRoles(interaction.guildId);

          const settings = await app.services.guildSettings.setVerifyPanel(
            interaction.guildId,
            interaction.guild.name,
            interaction.channelId,
            null,
            staffChannel.id,
            minDays
          );

          const payload = buildVerifyPanel(settings, roleIds);
          let existingMessage = null;

          if (settings.verifyChannelId && settings.verifyMessageId) {
            try {
              const channel = await interaction.guild.channels.fetch(settings.verifyChannelId);
              existingMessage = await channel.messages.fetch(settings.verifyMessageId);
            } catch {
              existingMessage = null;
            }
          }

          if (existingMessage) {
            await existingMessage.edit(payload);
            await interaction.reply({
              content: "อัปเดต verify panel เดิมแล้ว",
              ephemeral: true
            });
            return;
          }

          const sent = await interaction.channel.send(payload);

          await app.services.guildSettings.setVerifyPanel(
            interaction.guildId,
            interaction.guild.name,
            interaction.channelId,
            sent.id,
            staffChannel.id,
            minDays
          );

          await interaction.reply({
            content: `สร้าง verify panel แล้ว | staff channel: <#${staffChannel.id}> | minimum age: ${minDays} วัน`,
            ephemeral: true
          });
          return;
        }

        if (sub === "show") {
          const settings = await app.services.guildSettings.getGuildSettings(
            interaction.guildId,
            interaction.guild.name
          );
          const roleIds = await app.services.guildSettings.getVerifyRoles(interaction.guildId);

          await interaction.reply({
            content: [
              "✅ **Verify Configuration**",
              `**Panel Channel:** ${settings.verifyChannelId ? `<#${settings.verifyChannelId}>` : "ยังไม่ได้ตั้งค่า"}`,
              `**Panel Message ID:** ${settings.verifyMessageId || "ยังไม่ได้ตั้งค่า"}`,
              `**Staff Channel:** ${settings.verifyStaffChannelId ? `<#${settings.verifyStaffChannelId}>` : "ยังไม่ได้ตั้งค่า"}`,
              `**Min Account Age:** ${settings.verifyMinAccountAgeDays} วัน`,
              `**Roles:** ${roleIds.length ? roleIds.map(id => `<@&${id}>`).join(", ") : "ยังไม่ได้ตั้งค่า"}`
            ].join("\n"),
            ephemeral: true
          });
        }
      }
    }
  ],

  components: [
    {
      id: "verify_start",
      async execute(interaction, app) {
        const settings = await app.services.guildSettings.getGuildSettings(
          interaction.guildId,
          interaction.guild.name
        );
        const roleIds = await app.services.guildSettings.getVerifyRoles(interaction.guildId);

        if (!roleIds.length) {
          await interaction.reply({
            content: "ระบบ verify ยังไม่ได้ตั้ง role ที่จะได้รับ กรุณาให้แอดมินใช้ /verify setrole ก่อน",
            ephemeral: true
          });
          return;
        }

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const ageDays = verifyService.getAccountAgeDays(interaction.user);

        if (ageDays >= settings.verifyMinAccountAgeDays) {
          await verifyService.grantVerifyRoles(member, roleIds);

          await interaction.reply({
            content: `ยืนยันสำเร็จแล้ว คุณได้รับ role เรียบร้อย (อายุบัญชี ${ageDays} วัน)`,
            ephemeral: true
          });
          return;
        }

        const existingPending = await verifyService.getPendingRequest(interaction.guildId, interaction.user.id);
        if (existingPending) {
          await interaction.reply({
            content: "คำขอ verify ของคุณกำลังรอทีมงานตรวจสอบอยู่",
            ephemeral: true
          });
          return;
        }

        const request = await verifyService.createPendingRequest(interaction.guildId, interaction.user);
        const staffChannelId = settings.verifyStaffChannelId || settings.verifyChannelId || interaction.channelId;
        const staffChannel = await interaction.guild.channels.fetch(staffChannelId);

        const sent = await staffChannel.send(
          buildStaffReviewMessage({
            user: interaction.user,
            ageDays,
            thresholdDays: settings.verifyMinAccountAgeDays,
            requestId: request.id
          })
        );

        await verifyService.attachStaffMessageId(request.id, sent.id);

        await interaction.reply({
          content: `บัญชีของคุณใหม่กว่าเกณฑ์ที่กำหนด (${ageDays}/${settings.verifyMinAccountAgeDays} วัน) ระบบได้ส่งคำขอไปให้ทีมงานอนุมัติแล้ว`,
          ephemeral: true
        });
      }
    },
    {
      id: "verify_approve",
      async execute(interaction, app) {
        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์อนุมัติ verify"))) {
          return;
        }

        const [, requestId] = interaction.customId.split(":");
        const request = await verifyService.getRequestById(requestId);

        if (!request) {
          await interaction.reply({
            content: "ไม่พบคำขอ verify นี้",
            ephemeral: true
          });
          return;
        }

        if (request.status !== "PENDING") {
          await interaction.reply({
            content: `คำขอนี้ถูกจัดการแล้ว (${request.status})`,
            ephemeral: true
          });
          return;
        }

        const roleIds = await app.services.guildSettings.getVerifyRoles(interaction.guildId);
        const member = await interaction.guild.members.fetch(request.userId);

        await verifyService.grantVerifyRoles(member, roleIds);
        await verifyService.markApproved(request.id, interaction.user.id);

        await interaction.update(
          buildResolvedStaffMessage(
            "✅ VERIFY APPROVED",
            `อนุมัติ <@${request.userId}> โดย <@${interaction.user.id}> แล้ว`
          )
        );

        try {
          await member.send(`คุณได้รับการอนุมัติ verify ในเซิร์ฟเวอร์ **${interaction.guild.name}** แล้ว`);
        } catch {}
      }
    },
    {
      id: "verify_reject",
      async execute(interaction, app) {
        if (!(await requireManageBot(interaction, app, "คุณไม่มีสิทธิ์ปฏิเสธ verify"))) {
          return;
        }

        const [, requestId] = interaction.customId.split(":");
        const request = await verifyService.getRequestById(requestId);

        if (!request) {
          await interaction.reply({
            content: "ไม่พบคำขอ verify นี้",
            ephemeral: true
          });
          return;
        }

        if (request.status !== "PENDING") {
          await interaction.reply({
            content: `คำขอนี้ถูกจัดการแล้ว (${request.status})`,
            ephemeral: true
          });
          return;
        }

        await verifyService.markRejected(request.id, interaction.user.id);

        await interaction.update(
          buildResolvedStaffMessage(
            "❌ VERIFY REJECTED",
            `ปฏิเสธ <@${request.userId}> โดย <@${interaction.user.id}> แล้ว`,
            0xe74c3c
          )
        );

        try {
          const member = await interaction.guild.members.fetch(request.userId);
          await member.send(`คำขอ verify ของคุณในเซิร์ฟเวอร์ **${interaction.guild.name}** ถูกปฏิเสธ`);
        } catch {}
      }
    }
  ],

  init(app) {
    app.logger.info("verify module initialized");
  }
};