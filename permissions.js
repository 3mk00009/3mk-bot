const {
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

function errorEmbed(description) {
    return new EmbedBuilder()
        .setColor(0xed4245)
        .setDescription(`❌ ${description}`);
}

function successEmbed(description) {
    return new EmbedBuilder()
        .setColor(0x57f287)
        .setDescription(`✅ ${description}`);
}

function infoEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(title)
        .setDescription(description);
}

/**
 * Checks that the invoking member has the required permission(s).
 * Replies with an error embed and returns false if the check fails.
 */
async function requirePermission(interaction, permission, label) {
    if (!interaction.member.permissions.has(permission)) {
        await interaction.reply({
            embeds: [errorEmbed(`I need the **${label}** permission to use this command.`)],
            ephemeral: true
        });
        return false;
    }
    return true;
}

/**
 * Checks that the bot itself has the required permission(s) in the guild.
 */
async function requireBotPermission(interaction, permission, label) {
    const botMember = interaction.guild.members.me;
    if (!botMember.permissions.has(permission)) {
        await interaction.reply({
            embeds: [errorEmbed(`I need the **${label}** permission to do that.`)],
            ephemeral: true
        });
        return false;
    }
    return true;
}

module.exports = {
    PermissionFlagsBits,
    errorEmbed,
    successEmbed,
    infoEmbed,
    requirePermission,
    requireBotPermission
};
