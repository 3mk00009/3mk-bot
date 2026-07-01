const { SlashCommandBuilder } = require('discord.js');
const {
  PermissionFlagsBits,
  successEmbed,
  errorEmbed,
  requirePermission
} = require('../utils/permissions');
const { removeWarning, getWarnings } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delwarn')
    .setDescription('Delete a specific warning from a member')
    .addUserOption(option =>
      option.setName('user').setDescription('The member to remove a warning from').setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('id')
        .setDescription('The warning number (see /warnings), starting at 1')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!(await requirePermission(interaction, PermissionFlagsBits.ModerateMembers, 'Moderate Members'))) return;

    const target = interaction.options.getUser('user', true);
    const warnNumber = interaction.options.getInteger('id', true);

    const existing = await getWarnings(interaction.guild.id, target.id);
    if (existing.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed(`**${target.tag}** has no warnings.`)],
        ephemeral: true
      });
    }

    const removed = await removeWarning(interaction.guild.id, target.id, warnNumber - 1);
    if (!removed) {
      return interaction.reply({
        embeds: [errorEmbed(`Warning **#${warnNumber}** does not exist for **${target.tag}**.`)],
        ephemeral: true
      });
    }

    await interaction.reply({
      embeds: [successEmbed(`Removed warning **#${warnNumber}** from **${target.tag}**.\n**Reason was:** ${removed.reason}`)]
    });
  }
};
