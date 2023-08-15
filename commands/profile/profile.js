const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Replies with profile stats'),
	async execute({ interaction: interaction, db: db }) {
        // enter command here
		const user = interaction.user;
        console.log(user)
        const id = user.id;

        const userExists = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        console.log(userExists)
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
        
        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s profile`)
            .setDescription(`Here is your profile!`)
            .setColor('#00ff00')
            .setThumbnail(interaction.member.displayAvatarURL())
            // .setFooter(`Requested by ${interaction.member.displayName}`)
            .setTimestamp()
            .addFields(
                { name: 'Level', value: `${level}`, inline: true },
                { name: 'XP', value: `${xp}`, inline: true },
                { name: 'Rank', value: `${data.currentTierPatched}`, inline: true },
            )
            

        interaction.reply({ embeds: [embed] });
	},
};