for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Deploying ${commands.length} slash command(s)...`);

        if (guildId && guildId !== 'YOUR_TEST_SERVER_ID_HERE') {
            // Guild commands update instantly - great for testing
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
            console.log(`Successfully deployed commands to guild ${guildId}.`);
        } else {
            // Global commands can take up to an hour to propagate
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
            console.log('Successfully deployed global commands.');
        }
    } catch (error) {
        console.error('Failed to deploy commands:', error);
    }
})();
