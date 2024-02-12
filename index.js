const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const { rankUpdate } = require('./events/rankUpdate');
const { xpAdd } = require('./modules/xpAdd');
const db  = require('better-sqlite3')('eclipse.db', { verbose: console.log });
const config = require('./config.json');
const whitelist = require('./modules/whitelist');

dotenv.config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
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
    client.user.setActivity('/help');

    // Check rank every 5 minutes
    rankUpdate({ client: client })


    // Check if the required tables exist
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
    if(!tables.some(table => table.name === 'users')) {
        db.prepare(`CREATE TABLE users (id TEXT PRIMARY KEY, xp INTEGER, level INTEGER)`).run();
    }
    if(!tables.some(table => table.name === 'voice')) {
        db.prepare(`CREATE TABLE voice (id TEXT PRIMARY KEY, time INTEGER)`).run();
    }
    if(!tables.some(table => table.name === 'party')) {
        db.prepare(`CREATE TABLE party (id TEXT PRIMARY KEY, channel TEXT, time INTEGER)`).run();
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if(interaction.isButton()) {
        // Custom button handling
        const button = interaction.component;
        const customId = button.customId;

        if(customId == 'cancel') {
            // Delete the message)
            interaction.message.delete();
        }


        if(customId.startsWith('whitelist')) {
            const target = customId.split('-')[1];
            const user = await client.users.fetch(target);
            const channel = interaction.channel;
            whitelist({ user: user, channel: channel, interaction: interaction })
        }
        
    }
    if(interaction.isUserSelectMenu()) {
        // Custom select menu handling
        const menu = interaction.component;
        const customId = menu.customId;

        if(customId == 'userSelect') {
            // Get all of the users and whitelist them
            const users = interaction.users.map(user => user.id);
            const channel = await db.prepare('SELECT * FROM party WHERE id = ?').get(interaction.user.id);
            if(!channel) {
                interaction.reply({ content: `You don't have a party!`, ephemeral: true })
                return;
            }

            const channelObj = await interaction.guild.channels.fetch(channel.channel);
            console.log({users})
            whitelist({ user: users, channel: channelObj, interaction: interaction })

            interaction.reply({ content: `Whitelisted ${users.length} users!`, ephemeral: true })
        }
    }

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
    const guild = await client.guilds.cache.get(config.guild_id);
    if (message.guild != guild) return;
    
    const user = message.author;
    const id = user.id;
    const xpAdded = Math.floor(Math.random() * 7) + 8;

    xpAdd({ db: db, id: id, xp: xpAdded, client: client, guild: message.guild })

});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    if(newState.guild.id != config.guild_id && oldState.guild.id != config.guild_id) return;
    
    // Checking if they joined or left a voice channel
    if(newState.channelId != oldState.channelId) {

        // If they join a vc, we want to record the time of joining
        if(oldState.channelId == null && newState.channelId != null) {
            const id = newState.member.id;
            const time = Date.now();

            // Check if they already have a record
            const user = db.prepare('SELECT * FROM voice WHERE id = ?').get(id);
            if(user) {
                // If they do, update the time
                db.prepare('UPDATE voice SET time = ? WHERE id = ?').run(time, id);
                return;
            }

            db.prepare('INSERT INTO voice (id, time) VALUES (?, ?)').run(id, time);
        }

        // If they leave a vc, we want to delete the time of joining and give XP based on the time spent
        if(oldState.channelId != null && newState.channelId == null) {
            // Give them XP at the rate of 2xp/min
            const id = newState.member.id;
            const time = Date.now();
            const user = db.prepare('SELECT * FROM voice WHERE id = ?').get(id);
            if(user) {
                // Calculate XP
                const timeSpent = time - user.time;
                const xpAdded = Math.floor(timeSpent / 30000);
                
                xpAdd({ id: id, xp: xpAdded, db: db, client: client });
                db.prepare('DELETE FROM voice WHERE id = ?').run(id);

            }

            // Check if they are the last person in the VC
            const channel = oldState.channel;
            if(channel.members.size == 0) {
                // Check if the channel is a party channel
                const party = db.prepare('SELECT * FROM party WHERE channel = ?').get(channel.id);
                if(party) {
                    // If it is, delete the party
                    db.prepare('DELETE FROM party WHERE channel = ?').run(channel.id);
                    channel.delete();
                }
            }
        }
    }
})

client.login(process.env.DISCORD_TOKEN);