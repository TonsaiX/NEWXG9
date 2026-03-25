require("dotenv").config();

const env = {
  discordToken: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  databaseUrl: process.env.DATABASE_URL,
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development"
};

for (const [key, value] of Object.entries(env)) {
  if (value === undefined || value === null || value === "") {
    if (!["guildId"].includes(key)) {
      throw new Error(`Missing required env: ${key}`);
    }
  }
}

module.exports = env;