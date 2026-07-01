const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../utils/database');
const { errorEmbed } = require('../utils/permissions');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Show the top 10 XP leaderboard for this server'),

  async execute(interaction) {
    const leaderboard = await getLeaderboard(interaction.guild.id, 10);

    if (leaderboard.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed('No one has earned any XP in this server yet.')],
        ephemeral: true
      });
    }

    const lines = await Promise.all(
      leaderboard.map(async (entry, index) => {
        const rank = MEDALS[index] || `**#${index + 1}**`;
        const user = await interaction.client.users.fetch(entry.userId).catch(() => null);
        const name = user ? user.tag : `Unknown User (${entry.userId})`;
        return `${rank} ${name} — Level **${entry.level}** (${entry.totalXp} XP)`;
      })
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🏆 Leaderboard — ${interaction.guild.name}`)
      .setDescription(lines.join('\n'));

    await interaction.reply({ embeds: [embed] });
  }
};
