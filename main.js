const { Client, Intents, MessageEmbed } = require("discord.js");
const { token, channelId, blockNativeAPIKey, guildId, roleId } = require("./config.json");
const superagent = require("superagent");

async function sendMessage(client, infos, role) {
    const channel = client.channels.cache.get(channelId);
    const blockPrices = infos.blockPrices[0].estimatedPrices;
    // const role = client.guild.roles.cache.get("687978557598990367");
    // console.log("role", role);
    let message = new MessageEmbed()
        .setColor("#" + (((1 << 24) * Math.random()) | 0).toString(16))
        .setTitle(`Gas has been under 60 for 1minutes !`)
        .setDescription(`AAAAAAAH IIM BUYING ${role}`)
        .setTimestamp()
        .addFields(
            {
                name: `Confidence: ${blockPrices[0].confidence}`,
                value: `Price: ${blockPrices[0].price}\nMax Priority Fee: ${blockPrices[0].maxPriorityFeePerGas}\nMax Fee: ${blockPrices[0].maxFeePerGas}`,
                inline: true,
            },
            {
                name: `Confidence: ${blockPrices[1].confidence}`,
                value: `Price: ${blockPrices[1].price}\nMax Priority Fee: ${blockPrices[1].maxPriorityFeePerGas}\nMax Fee: ${blockPrices[1].maxFeePerGas}`,
                inline: true,
            },
            {
                name: `Confidence: ${blockPrices[2].confidence}`,
                value: `Price: ${blockPrices[2].price}\nMax Priority Fee: ${blockPrices[2].maxPriorityFeePerGas}\nMax Fee: ${blockPrices[2].maxFeePerGas}`,
                inline: true,
            }
        )
        .setFooter("Six Sigma NFT");

    // console.log("MESSAGE", message);

    channel.send({ embeds: [message] });
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
    let gasList = [];
    
    channel.send("Ready");

    setInterval(async () => {
        const res = await superagent
            .get(url)
            .query("confidenceLevels=99")
            .query("confidenceLevels=95")
            .query("confidenceLevels=90")
            .set("Authorization", blockNativeAPIKey);

        let gas = res.body.blockPrices[0].baseFeePerGas;
        if (gasList.length < 10) {
            gasList.push(gas);
        } else {
            gasList.shift();
            gasList.push(gas);

            let gasAverage = average(gasList);
            if (gasAverage < 60) {
                sendMessage(client, res.body, role);
                gasList = [];
            }
        }
        console.log(gas);
    }, 6000);
});

// Login to Discord with your client's token
client.login(token);
