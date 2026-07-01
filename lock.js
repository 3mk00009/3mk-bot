const { SlashCommandBuilder, ChannelType } = require('discord.js');
const {
  PermissionFlagsBits,
  successEmbed,
  errorEmbed,
  requirePermission,
  requireBotPermission
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a text channel so members cannot send messages')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to lock (defaults to this channel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!(await requirePermission(interaction, PermissionFlagsBits.ManageChannels, 'Manage Channels'))) return;
    if (!(await requireBotPermission(interaction, PermissionFlagsBits.ManageChannels, 'Manage Channels'))) return;

    const channel = interaction.options.getChannel('channel') || interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false
      });

      await interaction.reply({
        embeds: [successEmbed(`🔒 ${channel} has been locked.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        embeds: [errorEmbed('Something went wrong while trying to lock this channel.')],
        ephemeral: true
      });
    }
  }
};
