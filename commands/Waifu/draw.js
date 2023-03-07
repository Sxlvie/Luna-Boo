const { SlashCommandBuilder } = require('discord.js');
const { Waifu } = require('../../schemas/waifu')
const { User } = require('../../schemas/user')
const date = require('date-and-time')

const getTime = ({ timeDrawn: timeDrawn }) => {


    let timeRemaining = 86400000 - (Date.now() - timeDrawn)

    let seconds = timeRemaining / 1000
    let minutes = seconds / 60
    let hours = minutes / 60
    if(hours > 0) return `${hours}h`
    if(minutes > 0) return `${minutes}m`
    if(seconds > 0) return `${seconds}s` 

}


// random card from DB
const randomDraw = async () => {
    return Waifu.countDocuments().exec(function (err, count) {
        let random = Math.floor(Math.random() * count)

        User.findOne().skip(random).exec(
            function(err, result) {
               return result
            }
        )
    })
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('wdraw')
		.setDescription('Draw a pack'),
	async execute({ interaction: interaction, }) {
        // enter command here

        const doesUserExist = await User.exists({ id: interaction.member.id })
        console.log(doesUserExist)
        if(!doesUserExist) {
            console.log('user does not exist')
            await interaction.reply('You are not yet registered. Use the ``/register`` command to get registered!')
            return
        }
        let user = await User.findOne({ id: interaction.member.id })
        console.log({user})

        const draw = async() => {
            let newDraw = await Waifu.aggregate([{ $sample: { size: 1 } }])
            console.log(newDraw[0])
            user.cards.push(newDraw[0].id)
            console.log(user.cards)
            // await interaction.reply(newDraw.url)
            user.lastPack = Date.now()
            await user.save()
        }

        if(user.lastPack){
            if((Date.now() - user.lastPack) >= 86400000) {
                // if its more than 24h ago the user last drew a pack
                draw()
            } else {
                let remaining = getTime({timeDrawn: user.lastPack})
                await interaction.reply(`You have to wait ${remaining}`)
                return
            }
            
        } else {
            draw()
        }

        
        

        


	},
};