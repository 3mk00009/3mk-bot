const { QuickDB, JSONDriver } = require('quick.db');

// Stores all bot data (warnings, levels, etc.) in a plain JSON file
// located at the root of the project: ./database.json
const db = new QuickDB({
    driver: new JSONDriver('./database.json')
});

function warningsKey(guildId, userId) {
    return `warnings_${guildId}_${userId}`;
}

async function addWarning(guildId, userId, warning) {
    return db.push(warningsKey(guildId, userId), warning);
}

async function getWarnings(guildId, userId) {
    const warnings = await db.get(warningsKey(guildId, userId));
    return warnings || [];
}

async function removeWarning(guildId, userId, index) {
    const warnings = await getWarnings(guildId, userId);
    if (index < 0 || index >= warnings.length) return null;
    const removed = warnings.splice(index, 1);
    await db.set(warningsKey(guildId, userId), warnings);
    return removed;
}

const LEVEL_PREFIX = 'levels';

function levelKey(guildId, userId) {
    return `${LEVEL_PREFIX}_${guildId}_${userId}`;
}

// XP required to advance from 'level' to 'level + 1'
function xpForLevel(level) {
    return 5 * (level * level) + 50 * level + 100;
}

async function getLevelData(guildId, userId) {
    const data = await db.get(levelKey(guildId, userId));
    return data || { xp: 0, level: 0, totalXp: 0 };
}

/**
 * Adds XP to a user's scoped record and rolls them up through
 * as many level-ups as the gained XP covers.
 * Returns { data, leveledUp, previousLevel }
 */
async function addXp(guildId, userId, amount) {
    const data = await getLevelData(guildId, userId);
    const previousLevel = data.level;
    data.xp += amount;
    data.totalXp += amount;
    let leveledUp = false;
    while (data.xp >= xpForLevel(data.level)) {
        data.xp -= xpForLevel(data.level);
        data.level += 1;
        leveledUp = true;
    }
    await db.set(levelKey(guildId, userId), data);
    return { data, leveledUp, previousLevel };
}

/**
 * Returns the top 'limit' users in a guild, sorted by total XP earned.
 */
async function getLeaderboard(guildId, limit = 10) {
    const all = await db.all();
    const prefix = `${LEVEL_PREFIX}_${guildId}_`;
    const entries = all
        .filter(entry => entry.id.startsWith(prefix))
        .map(entry => ({
            userId: entry.id.slice(prefix.length),
            ...entry.value
        }))
        .sort((a, b) => b.totalXp - a.totalXp)
        .slice(0, limit);
    return entries;
}

module.exports = {
    db,
    addWarning,
    getWarnings,
    removeWarning,
    getLevelData,
    addXp,
    getLeaderboard
};
