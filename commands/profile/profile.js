const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Replies with profile stats')
        .addUserOption(option => option.setName(`target`).setDescription(`Find user's profile`).setRequired(false)),
	async execute({ interaction: interaction, db: db }) {
        // enter command here
        let user = interaction.user;

        // Check if there's a target
        const target = interaction.options.getUser('target');
        if(target) {
            // Do the same thing as below but for the target
            user = target;
        }
		
        console.log(user)
        const id = user.id;

        const userExists = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if(!userExists) {
            db.prepare('INSERT INTO users (id, xp, level) VALUES (?, ?, ?)').run(id, 0, 1);
            interaction.reply({ content: `Profile doesn't exist, made a new one.`, ephemeral: true })
            return;
        }

        let xp = userExists.xp;
        let level = userExists.level;
        if(!userExists) {
            [xp, level] = [0, 0];
            return;
        }
        console.log('DB check done')

        // Fetch data from the API
        const res = await fetch(`https://valorant.aesirdev.tech/api/bot/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.API_KEY
            },
            body: JSON.stringify({
                "user_id": `${id}`
            })
        })
        
        const data = await res.json();
        console.log(data)
        
        // Fetch member from user in guild
        let member = await interaction.guild.members.fetch(id);

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s profile`)
            .setDescription(`Here is your profile!`)
            .setColor('#00ff00')
            .setThumbnail(member.displayAvatarURL())
            .setFooter({ iconURL: interaction.member.displayAvatarURL(), text: `Requested by ${interaction.member.user.username}` })
            .setTimestamp()
            .addFields(
                { name: 'Level', value: `${level}`, inline: true },
                { name: 'XP', value: `${xp}/${15 * Math.pow(level, 2) + 100}`, inline: true },
                { name: 'Rank', value: `${data.currentTierPatched}`, inline: true },
            )
            

        interaction.reply({ embeds: [embed] });
	},
};