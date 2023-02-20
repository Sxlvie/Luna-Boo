const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Gives you a list of usable commands!')
        .addStringOption(option =>
			option.setName('category')
				.setDescription('Select a category')
				.setRequired(true)
				.addChoices(
					{ name: 'Interaction', value: 'int' },
					{ name: 'Miscellaneous', value: 'misc' },
					{ name: 'Moderation', value: 'mod' },
				)),
	async execute({ interaction: interaction, }) {
        // enter command here
		let selected = interaction.options.getString('category')
        let embed = new EmbedBuilder()
        .setTitle(`Help`)
        .setDescription(`Here is a list of commands you can use!`)
        .setColor('#00ff00')
        .setFooter(`Requested by ${interaction.member.displayName}`)
        .setTimestamp()
        if(selected === 'moderation') {
            embed.addField(`Moderation`, `ban\nkick\nremoverole\naddrole`)
        } else if(selected === 'miscellaneous') {
            embed.addField(`Miscellaneous`, `help\nping\nuptime`)
        } else if(selected === 'interaction') {
            embed.addField(`None currently`)
        }
	},
};