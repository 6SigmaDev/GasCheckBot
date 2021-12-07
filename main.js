const { Client, Intents } = require("discord.js");
const { token, channelId, infuraId } = require("./config.json");

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once("ready", async () => {
    const channel = client.channels.cache.get(channelId);
    channel.send("Ready");
});

// Login to Discord with your client's token
client.login(token);