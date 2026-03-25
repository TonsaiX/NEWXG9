const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

function buildWinloseMessage(profile) {
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
        `**📊 RATE** \`${winRate}%\``
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
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    components: [row1, row2]
  };
}

module.exports = { buildWinloseMessage };