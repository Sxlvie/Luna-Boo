const { SlashCommandBuilder } = require('discord.js');

import('pretty-ms')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription('Replies with the uptime of the bot.'),
	async execute({ interaction: interaction, }) {
		await interaction.reply(prettyMilliseconds(interaction.client.uptime))
	},
};