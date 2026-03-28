const express = require("express");
const path = require("path");
const env = require("../config/env");

async function startHttpServer(appCtx) {
  const app = express();

  app.use(express.json());
  app.use("/static", express.static(path.join(__dirname, "..", "..", "web")));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/overlay/:guildId", async (req, res) => {
    try {
      const guildId = req.params.guildId;
      const profile = await appCtx.services.profiles.getActiveProfile(guildId);
      const settings = await appCtx.services.guildSettings.getGuildSettings(guildId);

      if (!profile) {
        return res.json({
          profile: null,
          wins: 0,
          losses: 0,
          template: settings.winloseTemplate || "compact"
        });
      }

      return res.json({
        profile: profile.name,
        wins: profile.overlayState?.wins ?? 0,
        losses: profile.overlayState?.losses ?? 0,
        template: settings.winloseTemplate || "compact"
      });
    } catch (error) {
      appCtx.logger.error(error);
      return res.status(500).json({
        error: "Internal server error"
      });
    }
  });

  app.get("/overlay-ui/:guildId", (_req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "web", "overlay", "index.html"));
  });

  app.get("/newstar/:guildId", async (req, res) => {
    try {
      const guildId = req.params.guildId;
      const state = await appCtx.prisma.newStarState.findUnique({
        where: { guildId }
      });
      const settings = await appCtx.services.guildSettings.getGuildSettings(guildId);

      if (!state) {
        return res.json({
          rank: "EPIC V",
          displayRank: "EPIC V",
          stars: 0,
          template: settings.newstarTemplate || "compact"
        });
      }

      const displayRank =
        state.rank === "เทพสงคราม" && state.stars >= 50
          ? "มหาเทพสงคราม"
          : state.rank;

      return res.json({
        rank: state.rank,
        displayRank,
        stars: state.stars,
        template: settings.newstarTemplate || "compact"
      });
    } catch (error) {
      appCtx.logger.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/newstar-ui/:guildId", (_req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "web", "newstar", "index.html"));
  });

  app.listen(env.port, () => {
    appCtx.logger.info(`HTTP server running on port ${env.port}`);
  });
}

module.exports = { startHttpServer };