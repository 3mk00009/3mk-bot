const { SlashCommandBuilder } = require('discord.js');
const {
  PermissionFlagsBits,
  successEmbed,
  errorEmbed,
  requirePermission,
  requireBotPermission
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove a timeout (mute) from a member')
    .addUserOption(option =>
      option.setName('user').setDescription('The member to unmute').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the unmute').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!(await requirePermission(interaction, PermissionFlagsBits.ModerateMembers, 'Moderate Members'))) return;
    if (!(await requireBotPermission(interaction, PermissionFlagsBits.ModerateMembers, 'Moderate Members'))) return;

    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        embeds: [errorEmbed('That user is not a member of this server.')],
        ephemeral: true
      });
    }

    if (!member.communicationDisabledUntil) {
      return interaction.reply({
        embeds: [errorEmbed('That member is not currently muted.')],
        ephemeral: true
      });
    }

    try {
      await member.timeout(null, reason);

      await interaction.reply({
        embeds: [successEmbed(`**${target.tag}** has been unmuted.\n**Reason:** ${reason}`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        embeds: [errorEmbed('Something went wrong while trying to unmute this user.')],
        ephemeral: true
      });
    }
  }
};
