const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

function formatDirection(direction) {
  if (direction === "left-to-right") return "LEFT → RIGHT";
  if (direction === "right-to-left") return "RIGHT → LEFT";
  return "CENTER";
}

function buildTitleMessage(settings) {
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle("📝 STREAM TITLE CONTROLLER")
    .setDescription(
      [
        `**TITLE**`,
        `\`${settings.titleText || "NEWXG9 STREAM"}\``,
        "",
        `**DIRECTION**`,
        `\`${formatDirection(settings.titleDirection)}\``,
        "",
        "ใช้ปุ่มด้านล่างเพื่อแก้ไขข้อความหรือสลับทิศทาง"
      ].join("\n")
    )
    .setFooter({ text: "Live title overlay controller" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("title_add")
      .setLabel("Add Title")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("title_direction")
      .setLabel("Direction")
      .setStyle(ButtonStyle.Primary)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

function buildTitleModal(currentText = "") {
  const modal = new ModalBuilder()
    .setCustomId("title_add_modal")
    .setTitle("Add / Update Title");

  const input = new TextInputBuilder()
    .setCustomId("title_text")
    .setLabel("ข้อความ overlay")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(120)
    .setValue(String(currentText || "").slice(0, 120))
    .setPlaceholder("เช่น NEWXG9 RANKED MATCH");

  modal.addComponents(
    new ActionRowBuilder().addComponents(input)
  );

  return modal;
}

module.exports = {
  buildTitleMessage,
  buildTitleModal
};