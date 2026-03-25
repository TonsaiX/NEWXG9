module.exports = {
  name: "ready",
  once: true,
  async execute(client, _clientRef, app) {
    app.logger.info(`Logged in as ${client.user.tag}`);
  }
};