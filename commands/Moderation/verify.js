const { SlashCommandBuilder, EmbedBuilder, Embed, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Checks user valorant profile')
        .addUserOption(option => option.setName(`target`).setDescription(`Find user's profile`).setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
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

        // Fetch data from the API
        const res = await fetch(`${config.api_url}v1/valorant/by-discord`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.API_KEY,
                'Discord-ID': id
            }
        })
        
        const data = await res.json();
        console.log(data)
    


            

        interaction.reply({ content: `Username: ${data.gameName}#${data.tagLine}\nCurrent Rank: ${data.currentTierPatched}`, ephemeral: true });
	},
};