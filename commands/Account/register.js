const { SlashCommandBuilder } = require('discord.js');
const { User } = require('../../schemas/user')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your Discord account!'),
	async execute({ interaction: interaction }) {
        // enter command here

        if(await User.exists({ id: interaction.member.id })) {
            await interaction.reply('User already registered!')
            return
        }

		let user = User.find({id: interaction.member.id})
        const newUser = new User({
            id: interaction.member.id,
            lastPack: null,
            coins: null,
            cards: [],
        })
        await newUser.save()
        await interaction.reply('You are now registered!')
	},
};