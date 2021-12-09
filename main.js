const { Client, Intents, MessageEmbed } = require("discord.js");
const {
    token,
    channelId,
    blockNativeAPIKey,
    guildId,
    roleId,
} = require("./config.json");
const superagent = require("superagent");

async function sendMessage(client, infos, role) {
    const channel = client.channels.cache.get(channelId);
    const blockPrices = infos.blockPrices[0].estimatedPrices;

    let message = new MessageEmbed()
        .setColor("#" + (((1 << 24) * Math.random()) | 0).toString(16))
        .setTitle(`Gas has been under 80 for 1 minutes !`)
        .setDescription(`AAAAAAAH IIM BUYING ${role}`)
        .setTimestamp()
        .addFields(
            {
                name: `Confidence: ${blockPrices[0].confidence}`,
                value: `Price: ${blockPrices[0].price.toFixed(
                    0
                )}\nMax Priority Fee: ${blockPrices[0].maxPriorityFeePerGas.toFixed(
                    0
                )}\nMax Fee: ${blockPrices[0].maxFeePerGas.toFixed(0)}`,
                inline: true,
            },
            {
                name: `Confidence: ${blockPrices[1].confidence}`,
                value: `Price: ${blockPrices[1].price.toFixed(
                    0
                )}\nMax Priority Fee: ${blockPrices[1].maxPriorityFeePerGas.toFixed(
                    0
                )}\nMax Fee: ${blockPrices[1].maxFeePerGas.toFixed(0)}`,
                inline: true,
            },
            {
                name: `Confidence: ${blockPrices[2].confidence}`,
                value: `Price: ${blockPrices[2].price.toFixed(
                    0
                )}\nMax Priority Fee: ${blockPrices[2].maxPriorityFeePerGas.toFixed(
                    0
                )}\nMax Fee: ${blockPrices[2].maxFeePerGas.toFixed(0)}`,
                inline: true,
            }
        )
        .setFooter("Six Sigma NFT");

    channel.send({ embeds: [message] });
    channel.send(`${role}`);
}

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once("ready", async () => {
    const url = "https://api.blocknative.com/gasprices/blockprices";
    const channel = client.channels.cache.get(channelId);
    const guild = client.guilds.cache.get(guildId);
    const role = guild.roles.cache.get(roleId);
    const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    let timeBefore = 0;
    let gasList = [];

    channel.send("Ready");

    setInterval(async () => {
        const res = await superagent
            .get(url)
            .query("confidenceLevels=99")
            .query("confidenceLevels=95")
            .query("confidenceLevels=90")
            .query("confidenceLevels=70")
            .set("Authorization", blockNativeAPIKey);

        let gas = res.body.blockPrices[0].baseFeePerGas;
        let gasFast = res.body.blockPrices[0].estimatedPrices;

        client.user.setActivity(
            `⚡ ${gasFast[0].price}🚶${gasFast[2].price} 🐢${gasFast[3].price}`
        );
        console.log(Date.now() - timeBefore);
        if (Date.now() - timeBefore >= 20 * 60 * 1000) {
            console.log("back to workd")
            if (gasList.length < 2) {
                gasList.push(gas);
            } else {
                gasList.shift();
                gasList.push(gas);

                let gasAverage = average(gasList);
                if (gasAverage <= 100) {
                    sendMessage(client, res.body, role);
                    timeBefore = Date.now();
                    gasList = [];
                }
            }
        }
        console.log(gas);
    }, 6100);
});

// Login to Discord with your client's token
client.login(token);
