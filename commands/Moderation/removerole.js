const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removerole')
		.setDescription('Removes role from user!')
        .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Select a role').setRequired(true)),
	async execute({ interaction: interaction, }) {
        // enter command here
        
		if (interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            let target = interaction.options.getUser('target').id;
            let role = interaction.options.getRole('role');
            
            let user = interaction.guild.members.cache.find(u => u.id === target)
            

            user.roles.add(role);
            interaction.reply(`Successfully removed ${target} : ${role}!`)
        } else interaction.reply({ content: `You don't have permission to do this!`, ephemeral: true })
	},
};