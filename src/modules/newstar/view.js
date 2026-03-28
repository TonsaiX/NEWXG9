const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");
const { getDisplayRank } = require("./service");

function renderStars(rank, stars) {
  if (rank === "เทพสงคราม") {
    return `${stars} ดาว`;
  }

  const filled = "⭐".repeat(stars);
  const empty = "☆".repeat(Math.max(0, 5 - stars));
  return `${filled}${empty} (${stars}/5)`;
}

function buildNewStarMessage(state, template = "compact") {
  const rankLabel = getDisplayRank(state);
  const starsLabel = renderStars(state.rank, state.stars);

  const embed = new EmbedBuilder()
    .setColor(0xffd166)
    .setTitle("🌟 RANK STAR TRACKER")
    .setDescription(
      [
        `> **RANK**`,
        `> \`${rankLabel}\``,
        ``,
        `**STAR** ${starsLabel}`,
        `**🎨 TEMPLATE** \`${template.toUpperCase()}\``
      ].join("\n")
    )
    .setFooter({ text: "Live rank star panel" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ns_add_star")
      .setLabel("+ Star")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("ns_sub_star")
      .setLabel("- Star")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("ns_show_template_menu")
      .setLabel("เปลี่ยน Template")
      .setStyle(ButtonStyle.Primary)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

function buildNewstarTemplateMenu(currentTemplate = "compact") {
  return {
    content: `เลือก template ปัจจุบัน: **${currentTemplate}**`,
    ephemeral: true,
    components: [
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("ns_select_template")
          .setPlaceholder("เลือก template newstar")
          .addOptions(
            {
              label: "Compact",
              value: "compact",
              description: "กล่องเล็กแนวตั้ง เหมาะแปะข้างจอ",
              default: currentTemplate === "compact"
            },
            {
              label: "Banner",
              value: "banner",
              description: "แถบแนวนอน โชว์ rank และดาวเด่น",
              default: currentTemplate === "banner"
            },
            {
              label: "Orb",
              value: "orb",
              description: "วงแหวนกลาง สไตล์พรีเมียมสตรีม",
              default: currentTemplate === "orb"
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
  buildNewStarMessage,
  buildNewstarTemplateMenu
};