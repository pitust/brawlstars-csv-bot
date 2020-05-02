const ScCompression = require('sc-compression');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if (msg.author.bot) return;
    if (msg.content === '!csvdecode') {
        let [a, chk] = msg.attachments.array();
        if (chk || !a) {
            msg.reply('Add only one file to decode!');
            return;
        }
        let m = await msg.reply('Downloading attachment...');
        /**
         * @type {fetch.Response}
         */
        let res = await fetch(a.url);
        let buf = await res.buffer();
        await m.edit('Decompressing...');
        let data = ScCompression.decompress(buf);
        let em = new Discord.MessageEmbed();
        em.setAuthor('Made by pitust#8711');
        em.setColor('RED');
        em.setTitle('Your file has been decompressed!');
        let at = new Discord.MessageAttachment(data, a.name);
        em.attachFiles([at]);
        await m.channel.send(em)
    }
    if (msg.content === '!info') {
        msg.reply('The <@706058387942539285> is a bot which can decompress CSV files');
    }
    if (msg.content === '!help') {
        const embed = {
            "color": 1145312,
            "fields": [
                {
                    "name": "**More info**",
                    "value": "`!info`",
                    "inline": true
                },
                {
                    "name": "**Decode CSV (attached)**",
                    "value": "`!csvdecode`",
                    "inline": true
                }
            ]
        };
        msg.reply(new Discord.MessageEmbed(embed));
    }
});

client.login(require('fs').readFileSync('.secret').toString());