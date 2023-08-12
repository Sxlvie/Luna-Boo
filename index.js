const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const { rankUpdate } = require('./events/rankUpdate');

dotenv.config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

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
        console.log({command})
        if('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] Command at ${filepath} is missing "data" or "execute"`);
        }
    }
}

client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.tag}!`);
    client.user.setActivity('with your mom');

    // Check rank every 5 minutes
    rankUpdate({ client: client })
});

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    try {
        await command.execute({interaction: interaction});
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
})

client.login(process.env.DISCORD_TOKEN);