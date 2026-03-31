const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

function buildVerifyPanel(settings, roleIds) {
  const roleText = roleIds.length
    ? roleIds.map(id => `<@&${id}>`).join(", ")
    : "ยังไม่ได้ตั้งค่า role";

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("✅ VERIFY SYSTEM")
    .setDescription(
      [
        "╭───────────────╮",
        "   🔐 **VERIFY SYSTEM**",
        "╰───────────────╯",
        "",
        "✨ กดปุ่มด้านล่างเพื่อยืนยันตัวตนของคุณ",
        "",
        "┌────────────────────┐",
        `│ 📅 อายุบัญชีขั้นต่ำ: **${settings.verifyMinAccountAgeDays} วัน**`,
        "│ ⚡ ระบบตรวจสอบอัตโนมัติ",
        "│ 🛡️ ป้องกันบัญชีใหม่ / บัญชีเสี่ยง",
        "└────────────────────┘",
        "",
        "📌 **เงื่อนไข:**",
        "• บัญชีเก่าพอ → ได้รับยศทันที",
        "• บัญชีใหม่ → ส่งให้ทีมงานตรวจสอบ",
        "",
        "🎯 กดปุ่มด้านล่างเพื่อเริ่ม Verify"
      ].join("\n")
    )
    .setFooter({ text: "กดปุ่ม Verify เพื่อเริ่มตรวจสอบ" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("verify_start")
      .setLabel("Verify")
      .setStyle(ButtonStyle.Success)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

function buildStaffReviewMessage({ user, ageDays, thresholdDays, requestId }) {
  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle("🔔 VERIFY REVIEW REQUIRED")
    .setDescription(
      [
        `**User:** <@${user.id}>`,
        `**Username:** \`${user.tag ?? user.username}\``,
        `**Account Created:** <t:${Math.floor(user.createdAt.getTime() / 1000)}:F>`,
        `**Account Age:** \`${ageDays} วัน\``,
        `**Threshold:** \`${thresholdDays} วัน\``,
        "",
        "บัญชีนี้ใหม่กว่าที่กำหนด ต้องให้ทีมงานกดอนุมัติ"
      ].join("\n")
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`verify_approve:${requestId}`)
      .setLabel("Approve")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`verify_reject:${requestId}`)
      .setLabel("Reject")
      .setStyle(ButtonStyle.Danger)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

function buildResolvedStaffMessage(title, description, color = 0x95a5a6) {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
    ],
    components: []
  };
}

module.exports = {
  buildVerifyPanel,
  buildStaffReviewMessage,
  buildResolvedStaffMessage
};