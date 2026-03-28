const configCommand = require("./commands/config");

module.exports = {
  name: "admin",
  commands: [configCommand],
  components: [],
  init(app) {
    app.logger.info("admin module initialized");
  }
};