const express = require("express");
const path = require("path");
const env = require("../config/env");

async function startHttpServer(appCtx) {
  const app = express();

  app.use(express.json());

  // เสิร์ฟไฟล์ static จากโฟลเดอร์ web
  app.use("/static", express.static(path.join(__dirname, "..", "..", "web")));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  // API data สำหรับ overlay
  app.get("/overlay/:guildId", async (req, res) => {
    try {
      const guildId = req.params.guildId;
      const profile = await appCtx.services.profiles.getActiveProfile(guildId);

      if (!profile) {
        return res.json({
          profile: null,
          wins: 0,
          losses: 0
        });
      }

      return res.json({
        profile: profile.name,
        wins: profile.overlayState?.wins ?? 0,
        losses: profile.overlayState?.losses ?? 0
      });
    } catch (error) {
      appCtx.logger.error(error);
      return res.status(500).json({
        error: "Internal server error"
      });
    }
  });

  // หน้า UI สำหรับเปิดใน Chrome / OBS / TikTok Studio
  app.get("/overlay-ui/:guildId", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "web", "overlay", "index.html"));
  });

  app.listen(env.port, () => {
    appCtx.logger.info(`HTTP server running on port ${env.port}`);
  });
}

module.exports = { startHttpServer };