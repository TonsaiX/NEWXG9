const fs = require("fs");
const path = require("path");

function getCommandName(command) {
  if (typeof command?.data?.name === "string") return command.data.name;
  if (typeof command?.data?.toJSON === "function") return command.data.toJSON().name;
  return null;
}

function loadCommands(client, app) {
  const commandsDir = path.join(__dirname, "..", "commands");

  if (fs.existsSync(commandsDir)) {
    const files = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(commandsDir, file);
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
      const commandName = getCommandName(command);

      if (!commandName || typeof command.execute !== "function") {
        app.logger.warn(`Skipping invalid core command: ${file}`);
        continue;
      }

      client.commands.set(commandName, {
        ...command,
        moduleName: "core"
      });
    }
  }

  for (const [moduleName, mod] of client.modules.entries()) {
    for (const command of mod.commands || []) {
      const commandName = getCommandName(command);

      if (!commandName || typeof command.execute !== "function") {
        app.logger.warn(`Skipping invalid module command in ${moduleName}`);
        continue;
      }

      client.commands.set(commandName, {
        ...command,
        moduleName
      });
    }
  }

  app.logger.info(`Loaded ${client.commands.size} commands`);
}

module.exports = { loadCommands };