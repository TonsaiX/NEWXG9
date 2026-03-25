function registerComponentHandlers(client, app) {
  for (const [moduleName, mod] of client.modules.entries()) {
    for (const handler of mod.components || []) {
      client.componentHandlers.set(handler.id, {
        ...handler,
        moduleName
      });
    }
  }

  app.logger.info(`Loaded ${client.componentHandlers.size} component handlers`);
}

async function routeComponent(interaction, client, app) {
  const customId = interaction.customId;
  const baseId = customId.split(":")[0];

  const handler = client.componentHandlers.get(baseId);
  if (!handler) return false;

  await handler.execute(interaction, app);
  return true;
}

module.exports = {
  registerComponentHandlers,
  routeComponent
};