const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans selected user')
        .addUserOption(option => option.setName(`target`).setDescription(`Select user to ban`).setRequired(true))
        .addStringOption(option => option.setName(`reason`).setDescription(`Reason for ban`).setRequired(false)),
	async execute({ interaction: interaction, }) {
        // enter command here
		if(interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            let target = interaction.options.getUser('target').id
            let reason = interaction.options.getString('reason')
            let user = interaction.guild.members.cache.find(u => u.id === target)
            
            user.ban(`Action performed by ${interaction.member}, reason: ${reason}`)
            interaction.reply(`Banned ${target}`)
        } else(interaction.reply({ content: `You don't have permission to do this!`, ephemeral: true }))
	},
};