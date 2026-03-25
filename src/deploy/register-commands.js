const { REST, Routes } = require("discord.js");
const { createClient } = require("../core/client");
const { createApp } = require("../app");
const { loadModules } = require("../core/plugin-loader");
const { loadCommands } = require("../core/command-loader");
const env = require("../config/env");

async function main() {
  const client = createClient();
  const app = createApp(client);

  loadModules(client, app);
  loadCommands(client, app);

  const body = [...client.commands.values()].map(cmd => cmd.data.toJSON());

  const rest = new REST({ version: "10" }).setToken(env.discordToken);

  if (env.guildId) {
    await rest.put(
      Routes.applicationGuildCommands(env.clientId, env.guildId),
      { body }
    );
    console.log("Guild commands registered");
  } else {
    await rest.put(
      Routes.applicationCommands(env.clientId),
      { body }
    );
    console.log("Global commands registered");
  }
}

main().catch(console.error);