const { EmbedBuilder } = require('discord.js');
const { addXp } = require('./database');

const MIN_XP = 20;
const MAX_XP = 30;
const COOLDOWN_MS = 30 * 1000;

// In-memory cooldown tracker: "guildId_userId"
// -> timestamp of last XP gain.
// This resets if the bot restarts, which is fine
// for a spam-prevention cooldown.
const cooldowns = new Map();

function randomXp() {
    return Math.floor(Math.random() * (MAX_XP - MIN_XP + 1)) + MIN_XP;
}

function isOnCooldown(guildId, userId) {
    const key = `${guildId}_${userId}`;
    const last = cooldowns.get(key);
    if (last && Date.now() - last < COOLDOWN_MS) return true;
    cooldowns.set(key, Date.now());
    return false;
}

/**
 * Handles XP gain for a guild message. Awards
 * Random XP (20-30),
 * respects a 30s per-user cooldown, and announces
 * level-ups in the
 * channel the message was sent in.
 */
async function handleMessageXp(message) {
    if (!message.guild || message.author.bot) return;
    if (isOnCooldown(message.guild.id, message.author.id)) return;

    const gained = randomXp();
    const { data, leveledUp } = await addXp(message.guild.id, message.author.id, gained);

    if (leveledUp) {
        const embed = new EmbedBuilder()
            .setColor(0xfee75c)
            .setDescription(`${message.author} just leveled up to **Level ${data.level}**!`);

        await message.channel.send({ embeds: [embed] })
            .catch(e => null);
    }
}

module.exports = {
    handleMessageXp,
    MIN_XP,
    MAX_XP,
    COOLDOWN_MS
};
