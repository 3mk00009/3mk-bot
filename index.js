// main.js - كود تشغيل البوت الأساسي
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

// ضع التوكن الخاص بالبوت هنا بدلاً من النص الموجود
client.login('MTUyMTY5MTE4MzYwMzI1NzUyNQ.G3Wpdk.fuw6qi6K4BPfyOuEempINrPkmjf35t7y-TiUFg');