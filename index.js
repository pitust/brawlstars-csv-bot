const ScCompression = require('sc-compression');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        status: 'online',
        activity: {
            type: 'LISTENING',
            name: 'commands from brawl stars modders'
        }
    }).then(console.log)
});
let sigID = [
    'NONE',
    'LZMA',
    'SC',
    'SCLZ',
    'SIG'
]
let chanswm = [];
let stats = {};
try {
    let o = JSON.parse(require('fs').readFileSync('data.json').toString())
    chanswm = o.chans;
    stats = o.stats;
} catch (_e) { }
client.on('message', async msg => {
    try {
        if (msg.author.bot) return;
        chanswm.includes(msg.channel.id) || chanswm.push(msg.channel.id);
        if (!stats[msg.author.id]) stats[msg.author.id] = 0;
        if (msg.content === '!csvdecode') {
            stats[msg.author.id]++;
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
            let type = ScCompression.readSignature(buf);
            await m.delete();
            let em = new Discord.MessageEmbed();
            em.setAuthor('Made by pitust#8711');
            em.setColor('RED');
            em.setTitle('Your file has been decompressed!');
            em.addField('Format', sigID[type]);
            let at = new Discord.MessageAttachment(data, a.name);
            em.attachFiles([at]);
            await m.channel.send(em)
        }
        if (msg.content.startsWith('!!announce') && msg.author.id == '696410219663851552') {
            let t = 0, f = 0;
            for (let c of chanswm) {
                t++;
                try {
                    await client.channels.cache.get(c).send(msg.content.slice(10));
                    f++;
                } catch (_e) { }
            }
            await msg.reply(`Sent to ${t} channels, OK in ${f} channels, ${Math.floor(f / t * 100)}%`);
        }
        if (msg.content.startsWith('!!stats') && msg.author.id == '696410219663851552') {
            let m = [];
            for (let user in stats) {
                m.push(`<@${user}> = ${stats[user]}`);
            }
            await msg.channel.send(m.join('\n'));
        }
        if (msg.content.startsWith('!!die') && msg.author.id == '696410219663851552') {
            require('fs').writeFileSync('data.json', JSON.stringify({
                chans: chanswm,
                stats
            }));
            let t = 0, f = 0;
            for (let c of chanswm) {
                t++;
                try {
                    //await client.channels.cache.get(c).send('The bot is shutting down for maintanance. This will only take a second or two.');
                    f++;
                } catch (_e) { }
            }
            await msg.reply(`Sent to ${t} channels, OK in ${f} channels, ${Math.floor(f / t * 100)}%`);
            process.exit(0);
        }
        if (msg.content.startsWith('!csvencode')) {
            stats[msg.author.id]++;
            let [a, chk] = msg.attachments.array();
            let typeName = msg.content.slice(11);
            if (!typeName) {
                msg.reply('You need to tell me what signature to use! (NONE, LZMA, SC, SCLZ, SIG)');
            }
            if (chk || !a) {
                msg.reply('Add only one file to encode!');
                return;
            }
            let type = sigID.findIndex(e => e == typeName);
            if (type === -1) {
                msg.reply('Invalid encoding type! Available are: NONE, LZMA, SC, SCLZ, SIG');
                return;
            }
            let m = await msg.reply('Downloading attachment...');
            /**
             * @type {fetch.Response}
             */
            let res = await fetch(a.url);
            let buf = await res.buffer();
            await m.edit('Compressing...');
            let data = ScCompression.compress(buf, type);
            let em = new Discord.MessageEmbed();
            await m.delete();
            em.setAuthor('Made by pitust#8711');
            em.setColor('RED');
            em.setTitle('Your file has been compressed!');
            let at = new Discord.MessageAttachment(data, a.name);
            em.attachFiles([at]);
            await m.channel.send(em);
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
                    },
                    {
                        "name": "**Encode CSV (attached)**",
                        "value": "`!csvencode <format>`",
                        "inline": true
                    }
                ]
            };
            msg.reply(new Discord.MessageEmbed(embed));
        }
    } catch (e) {
        await msg.reply('Error (DM <@696410219663851552> with the error)\n' + e.stack);
    }
});

client.login(require('fs').readFileSync('.secret').toString());