const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");

function buildWinloseMessage(profile, template = "compact") {
  const wins = profile?.overlayState?.wins ?? 0;
  const losses = profile?.overlayState?.losses ?? 0;
  const profileName = profile?.name ?? "NO ACTIVE PROFILE";

  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(0) : "0";

  const embed = new EmbedBuilder()
    .setColor(0xf5f5f5)
    .setTitle("🎮 WIN / LOSE TRACKER")
    .setDescription(
      [
        `> **PROFILE**`,
        `> \`${profileName.toUpperCase()}\``,
        ``,
        `**🏆 WIN**  \`${wins}\``,
        `**💀 LOSE** \`${losses}\``,
        `**📊 RATE** \`${winRate}%\``,
        `**🎨 TEMPLATE** \`${template.toUpperCase()}\``
      ].join("\n")
    )
    .setFooter({
      text: "Live tracking panel"
    })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("wl_add_win")
      .setLabel("+ Win")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("wl_add_loss")
      .setLabel("+ Lose")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("wl_cycle_profile")
      .setLabel("เปลี่ยนโปรไฟล์")
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("wl_sub_win")
      .setLabel("- Win")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("wl_sub_loss")
      .setLabel("- Lose")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("wl_reset")
      .setLabel("Reset")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("wl_show_template_menu")
      .setLabel("เปลี่ยน Template")
      .setStyle(ButtonStyle.Primary)
  );

  return {
    embeds: [embed],
    components: [row1, row2]
  };
}

function buildWinloseTemplateMenu(currentTemplate = "compact") {
  return {
    content: `เลือก template ปัจจุบัน: **${currentTemplate}**`,
    ephemeral: true,
    components: [
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("wl_select_template")
          .setPlaceholder("เลือก template win/lose")
          .addOptions(
            {
              label: "Compact",
              value: "compact",
              description: "กล่องเล็กแนวตั้ง เหมาะแปะข้างจอ",
              default: currentTemplate === "compact"
            },
            {
              label: "Scorebar",
              value: "scorebar",
              description: "แถบแนวนอน เหมาะวางบนหรือล่างจอ",
              default: currentTemplate === "scorebar"
            },
            {
              label: "Duel",
              value: "duel",
              description: "ซ้ายชนะ ขวาแพ้ กลางเป็นอัตราชนะ",
              default: currentTemplate === "duel"
            },
            {
              label: "Clean",
              value: "clean",
              description: "เรียบ โล้น อ่านง่ายสุด",
              default: currentTemplate === "clean"
            }
          )
      )
    ]
  };
}

module.exports = {
  buildWinloseMessage,
  buildWinloseTemplateMenu
};