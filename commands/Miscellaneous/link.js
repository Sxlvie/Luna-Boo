const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Link your Valorant account to your Discord account!'),
	async execute({ interaction: interaction, db: db }) {
        // enter command here
		
        const embed = new EmbedBuilder()
            .setTitle('Link your Valorant account')
            .setDescription('Click the button below to link your Valorant account to your Discord account!')
            .setColor('#00ff00')
            .setThumbnail(interaction.member.displayAvatarURL())
            .setFooter({ text: `Requested by ${interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL() })
            .setTimestamp();

        const settings = new ButtonBuilder()
            .setURL('https://valorant.aesirdev.tech/settings')
            .setLabel('Link')
            .setStyle(ButtonStyle.Link)

        const guide = new ButtonBuilder()
            .setLabel('Guide')
            .setURL('https://valorant.aesirdev.tech/link')
            .setStyle(ButtonStyle.Link)

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder()
            .addComponents(settings, guide, cancel)

        interaction.reply({ embeds: [embed], components: [row] })
        
	},
};