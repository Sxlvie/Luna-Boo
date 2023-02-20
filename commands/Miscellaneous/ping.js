const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute({ interaction: interaction, }) {
        // enter command here
		await interaction.reply('Pong!');
	},
};