const fs = require("fs");
const path = require("path");

function loadModules(client, app) {
  const modulesDir = path.join(__dirname, "..", "modules");
  const moduleNames = fs.readdirSync(modulesDir);

  for (const moduleName of moduleNames) {
    const indexPath = path.join(modulesDir, moduleName, "index.js");
    if (!fs.existsSync(indexPath)) continue;

    delete require.cache[require.resolve(indexPath)];
    const mod = require(indexPath);

    if (!mod.name) {
      throw new Error(`Module ${moduleName} is missing name`);
    }

    client.modules.set(mod.name, mod);

    if (typeof mod.init === "function") {
      mod.init(app);
    }
  }

  app.logger.info(`Loaded ${client.modules.size} modules`);
}

module.exports = { loadModules };