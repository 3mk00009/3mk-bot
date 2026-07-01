const { SlashCommandBuilder } = require('discord.js');
const {
  PermissionFlagsBits,
  successEmbed,
  errorEmbed,
  requirePermission
} = require('../utils/permissions');
const { addWarning } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(option =>
      option.setName('user').setDescription('The member to warn').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the warning').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!(await requirePermission(interaction, PermissionFlagsBits.ModerateMembers, 'Moderate Members'))) return;

    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);

    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [errorEmbed('You cannot warn yourself.')],
        ephemeral: true
      });
    }

    const warning = {
      reason,
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      timestamp: Date.now()
    };

    await addWarning(interaction.guild.id, target.id, warning);

    await target.send(
      `You have received a **warning** in **${interaction.guild.name}**.\nReason: ${reason}`
    ).catch(() => null);

    await interaction.reply({
      embeds: [successEmbed(`**${target.tag}** has been warned.\n**Reason:** ${reason}`)]
    });
  }
};
