const { SlashCommandBuilder } = require('discord.js');
const {
  PermissionFlagsBits,
  infoEmbed,
  requirePermission
} = require('../utils/permissions');
const { getWarnings } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('List all warnings for a member')
    .addUserOption(option =>
      option.setName('user').setDescription('The member to check').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!(await requirePermission(interaction, PermissionFlagsBits.ModerateMembers, 'Moderate Members'))) return;

    const target = interaction.options.getUser('user', true);
    const warnings = await getWarnings(interaction.guild.id, target.id);

    if (warnings.length === 0) {
      return interaction.reply({
        embeds: [infoEmbed(`Warnings for ${target.tag}`, 'This user has no warnings.')],
        ephemeral: true
      });
    }

    const description = warnings
      .map((w, i) => {
        const date = new Date(w.timestamp).toLocaleString();
        return `**#${i + 1}** — ${w.reason}\n*By ${w.moderatorTag} on ${date}*`;
      })
      .join('\n\n');

    await interaction.reply({
      embeds: [infoEmbed(`Warnings for ${target.tag} (${warnings.length})`, description)],
      ephemeral: true
    });
  }
};
