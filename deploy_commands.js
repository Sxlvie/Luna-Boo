const { REST, Routes } = require('discord.js');
const { client_id } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
dotenv.config();

const token = process.env.DISCORD_TOKEN;

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, 'commands');
//get subdirectories
const subdirs = fs.readdirSync(commandsPath).filter(file => fs.statSync(path.join(commandsPath, file)).isDirectory());
console.log(subdirs);
//get files in subdirectories
for (const subdir of subdirs) {
    const subdirPath = path.join(commandsPath, subdir);
    const commandFiles = fs.readdirSync(subdirPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filepath = path.join(subdirPath, file);
        const command = require(filepath);
        if('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON())
        } else {
            console.log(`[WARNING] Command at ${filepath} is missing "data" or "execute"`);
        }
    }
}

console.log(commands)

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(client_id),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();