const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");

function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
  });

  client.commands = new Collection();
  client.componentHandlers = new Map();
  client.modules = new Map();

  return client;
}

module.exports = { createClient };