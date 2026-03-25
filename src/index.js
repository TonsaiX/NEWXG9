const env = require("./config/env");
const { createClient } = require("./core/client");
const { createApp } = require("./app");
const { loadModules } = require("./core/plugin-loader");
const { loadCommands } = require("./core/command-loader");
const { registerComponentHandlers } = require("./core/component-router");
const { loadEvents } = require("./core/event-loader");
const { startHttpServer } = require("./http/server");

async function bootstrap() {
  const client = createClient();
  const app = createApp(client);

  loadModules(client, app);
  loadCommands(client, app);
  registerComponentHandlers(client, app);
  loadEvents(client, app);

  await startHttpServer(app);
  await client.login(env.discordToken);
}

bootstrap().catch(err => {
  console.error("Fatal bootstrap error:", err);
  process.exit(1);
});