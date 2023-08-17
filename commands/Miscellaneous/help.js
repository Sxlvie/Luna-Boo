const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Gives you a list of usable commands!'),
	async execute({ interaction: interaction, }) {

        // Make the embed
        const embed = new EmbedBuilder()
            .setTitle(`Help`)
            .setDescription(`If you need help with anything, please contact <@605442511997108224>`)
            .setColor('#00ff00')
            .setThumbnail(interaction.member.displayAvatarURL())
            .setFooter({ text: `Requested by ${interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL() })

	},
};