const fs = require("fs");
const path = require("path");

function loadEvents(client, app) {
  const eventsDir = path.join(__dirname, "..", "events");
  const files = fs.readdirSync(eventsDir).filter(file => file.endsWith(".js"));

  for (const file of files) {
    const event = require(path.join(eventsDir, file));

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client, app));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client, app));
    }
  }

  app.logger.info(`Loaded ${files.length} events`);
}

module.exports = { loadEvents };