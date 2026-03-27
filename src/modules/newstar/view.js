const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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

function buildNewStarMessage(state) {
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
        `**STAR** ${starsLabel}`
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
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

module.exports = { buildNewStarMessage };