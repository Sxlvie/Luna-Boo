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


		// do a check to see if it already exists in DB
		let check = await Waifu.find({name: target})
		if(check) {
			await interaction.reply('Already exists in DB')
			return
		}

		// use yande.re to get the data
		const baselink = 'https://yande.re/post.json?&api_version=2&tags=rating%3Asafe+'

		const newLink = baselink + encodeURIComponent(target)
		console.log(newLink)
		let pickList = await fetch(newLink)
		let pick = await pickList.json()
		// console.log(pick)
		let topPick = pick.posts.reduce((acc, curr) => {
			if(curr.score > acc.score) {
				return curr
			}
			return acc
		})

		let probability = {"common": 0.5, "uncommon": 0.2, "rare": 0.1, "mythical": 0.05, "legendary": 0.01}
		let sum = 0
		for (let j in probability) {
			sum += probability[j]
		}

		function pickRandom() {
			let newpick = Math.random()*sum
			for (let j in probability) {
				newpick -= probability[j]
				if(newpick <= 0) return j;
			}
		}

		let rarity = pickRandom()
		console.log(rarity)

		const waifu = new Waifu({
			name: target.replace('_', ' '),
			url: topPick.file_url,
			rarity: rarity,
			id: topPick.id
		})
		
		await waifu.save()

		await interaction.reply(topPick.file_url)

	},
};