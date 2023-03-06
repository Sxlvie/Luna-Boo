const { SlashCommandBuilder } = require('discord.js');
const { Waifu } = require('../../schemas/waifu')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wrequest')
		.setDescription('Request a waifu/husbando to be added to the game.')
		.addStringOption(opt => 
			opt.setName('link')
			.setDescription('Link for the waifu/husbando (read info on how to request first)')
			.setRequired(true)),
	async execute({ interaction: interaction, }) {
        // enter command here

		let target = interaction.options.getString('link')
		// use yande.re to get the data
		const baselink = 'https://yande.re/post.json?&api_version=2tags=rating%3Asafe+'
		// let data = await fetch(target)
		// console.log(data)

		// console.log(encodeURIComponent(target));
		const newLink = baselink + encodeURIComponent(target)
		fetch(newLink)
  			.then((response) => response.json())
  			.then((data) => console.log(data.reduce((acc, curr) => {
				if(curr.score > acc.score) {
					return curr
				}
				return acc
			})));
		
		// const waifu = new Waifu({
		// 	name: 'test',
		// 	url: 'test',
		// 	rarity: 'legendary'
		// })
		
		// await waifu.save()

		await interaction.reply('check logs')

	},
};