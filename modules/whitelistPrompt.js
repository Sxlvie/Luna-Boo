const { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');

async function whitelistPrompt({ interaction: interaction, party: party, }) {
    // Make a followup embed to ask for the user to whitelist
    const embed = new EmbedBuilder()
        .setTitle(`Whitelist`)
        .setDescription(`Who would you like to whitelist?`)
        .setColor('#00ff00')
        .setFooter({ iconURL: interaction.member.user.displayAvatarURL(), text: `Requested by ${interaction.member.user.username}` })
        .setTimestamp()

        const select = new UserSelectMenuBuilder()
            .setCustomId('userSelect')
            .setPlaceholder('Select a user to whitelist')
            .setMinValues(1)
            .setMaxValues(4)

        // Add buttons
        const Whitelist = new ButtonBuilder()
            .setCustomId(`Whitelist`)
            .setLabel('Whitelist')
            .setStyle(ButtonStyle.Primary)
        
        const Cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)


        const row1 = new ActionRowBuilder()
            .addComponents(select)
        const row2 = new ActionRowBuilder()
            .addComponents(Whitelist, Cancel)
        
        
    // Send the embed
    interaction.followUp({ 
        embeds: [embed],
        components: [row1],
        ephemeral: true 
    })

    
}

module.exports = whitelistPrompt;