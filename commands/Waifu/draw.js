const { SlashCommandBuilder } = require('discord.js');
const { Waifu } = require('../../schemas/waifu')
const { User } = require('../../schemas/user')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wdraw')
		.setDescription('Draw a pack'),
	async execute({ interaction: interaction, }) {
        // enter command here

        let user = User.find({ id: interaction.member.id })
        if(!user) {
            interaction.reply(`You're not registered.`)
            return
        }

        const draw = async() => {
            let newDraw = await Waifu.aggregate([{ $sample: { size: 1 } }])
            user.cards.push(newDraw.id)
            await interaction.reply(newDraw.url)
        }

        if(user.lastPack){
            if((Date.now() - user.lastPack) >= 86400000) {
                // if its more than 24h ago the user last drew a pack
                draw()
            } else {
                let timeSince = Date.now() - user.lastPack
                await interaction.reply()
            }
            
        }

        user.lastPack = Date.now()
        user.save()

        


	},
};