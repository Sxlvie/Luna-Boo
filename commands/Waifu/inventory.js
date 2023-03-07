const { SlashCommandBuilder } = require('discord.js');
const { User } = require('../../schemas/user')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('winventory')
		.setDescription('Check your inventory of cards'),
	async execute({ interaction: interaction }) {
        // enter command here
		let user = await User.findOne({ id: interaction.member.id })
        console.log(user.cards)
	},
};