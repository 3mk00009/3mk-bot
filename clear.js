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
    .setName('clear')
    .setDescription('Bulk delete messages from this channel')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!(await requirePermission(interaction, PermissionFlagsBits.ManageMessages, 'Manage Messages'))) return;
    if (!(await requireBotPermission(interaction, PermissionFlagsBits.ManageMessages, 'Manage Messages'))) return;

    const amount = interaction.options.getInteger('amount', true);
    const user = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await interaction.channel.messages.fetch({ limit: 100 });

      if (user) {
        messages = messages.filter(m => m.author.id === user.id);
      }

      messages = Array.from(messages.values()).slice(0, amount);

      if (messages.length === 0) {
        return interaction.editReply({
          embeds: [errorEmbed('No matching messages found to delete.')]
        });
      }

      const deleted = await interaction.channel.bulkDelete(messages, true);

      await interaction.editReply({
        embeds: [successEmbed(`Deleted **${deleted.size}** message(s).`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('Something went wrong while clearing messages. Messages older than 14 days cannot be bulk deleted.')]
      });
    }
  }
};
