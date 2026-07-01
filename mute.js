const { SlashCommandBuilder } = require('discord.js');
const {
  PermissionFlagsBits,
  successEmbed,
  errorEmbed,
  requirePermission,
  requireBotPermission
} = require('../utils/permissions');

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000; // Discord's hard limit: 28 days

function parseDuration(input) {
  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(input.trim());
  if (!match) return null;

  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

  return amount * multipliers[unit];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout (mute) a member for a set duration')
    .addUserOption(option =>
      option.setName('user').setDescription('The member to mute').setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('duration')
        .setDescription('Duration, e.g. 10m, 2h, 1d (max 28d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the mute').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!(await requirePermission(interaction, PermissionFlagsBits.ModerateMembers, 'Moderate Members'))) return;
    if (!(await requireBotPermission(interaction, PermissionFlagsBits.ModerateMembers, 'Moderate Members'))) return;

    const target = interaction.options.getUser('user', true);
    const durationInput = interaction.options.getString('duration', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const ms = parseDuration(durationInput);
    if (!ms || ms <= 0) {
      return interaction.reply({
        embeds: [errorEmbed('Invalid duration format. Use something like `10m`, `2h`, or `1d`.')],
        ephemeral: true
      });
    }
    if (ms > MAX_TIMEOUT_MS) {
      return interaction.reply({
        embeds: [errorEmbed('Duration cannot exceed 28 days.')],
        ephemeral: true
      });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        embeds: [errorEmbed('That user is not a member of this server.')],
        ephemeral: true
      });
    }
    if (!member.moderatable) {
      return interaction.reply({
        embeds: [errorEmbed('I cannot mute this member. They may have a higher role than me.')],
        ephemeral: true
      });
    }

    try {
      await member.timeout(ms, reason);

      await target.send(
        `You have been **muted** in **${interaction.guild.name}** for ${durationInput}.\nReason: ${reason}`
      ).catch(() => null);

      await interaction.reply({
        embeds: [successEmbed(`**${target.tag}** has been muted for **${durationInput}**.\n**Reason:** ${reason}`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        embeds: [errorEmbed('Something went wrong while trying to mute this user.')],
        ephemeral: true
      });
    }
  }
};
