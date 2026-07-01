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
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option =>
      option.setName('user').setDescription('The member to ban').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the ban').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    if (!(await requirePermission(interaction, PermissionFlagsBits.BanMembers, 'Ban Members'))) return;
    if (!(await requireBotPermission(interaction, PermissionFlagsBits.BanMembers, 'Ban Members'))) return;

    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (member) {
      if (!member.bannable) {
        return interaction.reply({
          embeds: [errorEmbed('I cannot ban this member. They may have a higher role than me.')],
          ephemeral: true
        });
      }
      if (member.id === interaction.user.id) {
        return interaction.reply({
          embeds: [errorEmbed('You cannot ban yourself.')],
          ephemeral: true
        });
      }
    }

    try {
      await target.send(
        `You have been **banned** from **${interaction.guild.name}**.\nReason: ${reason}`
      ).catch(() => null);

      await interaction.guild.members.ban(target.id, { reason });

      await interaction.reply({
        embeds: [successEmbed(`**${target.tag}** has been banned.\n**Reason:** ${reason}`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        embeds: [errorEmbed('Something went wrong while trying to ban this user.')],
        ephemeral: true
      });
    }
  }
};
