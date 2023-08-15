const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const { rankUpdate } = require('./events/rankUpdate');
const db  = require('better-sqlite3')('eclipse.db', { verbose: console.log });

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

    // Check if users table exists in database
    const table = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'users\'').get();
    if(!table['count(*)']) {
        db.prepare('CREATE TABLE users (id TEXT PRIMARY KEY, xp INTEGER, level INTEGER)').run();
        db.prepare('CREATE UNIQUE INDEX idx_users_id ON users (id)').run();
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    try {
        await command.execute({interaction: interaction, db: db, client: client});
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
})

client.on(Events.MessageCreate, async message => {
    // Setting up level system
    if(message.author.bot) return;
    if(message.channel.type === 'dm') return;
    const guild = await client.guilds.cache.get(process.env.GUILD_ID);
    if (message.guild != guild) return;
    
    const user = message.author;
    const id = user.id;

    const userExists = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if(!userExists) {
        db.prepare('INSERT INTO users (id, xp, level) VALUES (?, ?, ?)').run(id, 0, 1);
        return;
    }

    const xp = userExists.xp;
    const level = userExists.level;

    const xpAdd = Math.floor(Math.random() * 7) + 8;
    const newXP = xp + xpAdd;

    const nextLevel = level * 300;
    if(newXP >= nextLevel) {
        db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(0, level + 1, id);
        const levelUpEmbed = {
            color: 0x0099ff,
            title: 'Level Up!',
            description: `${user} has leveled up to level ${level + 1}!`,
            timestamp: new Date(),
            footer: {
                text: 'Eclipse Bot'
            }
        };
        message.channel.send({ embeds: [levelUpEmbed] });
        return;
    }
    db.prepare('UPDATE users SET xp = ? WHERE id = ?').run(newXP, id);

});

client.login(process.env.DISCORD_TOKEN);