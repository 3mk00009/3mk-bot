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
    .setName('unban')
    .setDescription('Unban a user by their user ID')
    .addStringOption(option =>
      option.setName('userid').setDescription('The user ID to unban').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the unban').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    if (!(await requirePermission(interaction, PermissionFlagsBits.BanMembers, 'Ban Members'))) return;
    if (!(await requireBotPermission(interaction, PermissionFlagsBits.BanMembers, 'Ban Members'))) return;

    const userId = interaction.options.getString('userid', true).trim();
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!/^\d{15,25}$/.test(userId)) {
      return interaction.reply({
        embeds: [errorEmbed('That does not look like a valid user ID.')],
        ephemeral: true
      });
    }

    try {
      const bans = await interaction.guild.bans.fetch();
      if (!bans.has(userId)) {
        return interaction.reply({
          embeds: [errorEmbed('That user is not currently banned.')],
          ephemeral: true
        });
      }

      await interaction.guild.members.unban(userId, reason);

      await interaction.reply({
        embeds: [successEmbed(`User with ID **${userId}** has been unbanned.\n**Reason:** ${reason}`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        embeds: [errorEmbed('Something went wrong while trying to unban this user.')],
        ephemeral: true
      });
    }
  }
};
