const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Sets up the rank roles')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
	async execute({ interaction: interaction, }) {
        // enter command here
		if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: `You don't have permission to do this!`, ephemeral: true })

        const guild = interaction.guild

        const rankList = [
            "Unranked",
            "Iron",
            "Bronze",
            "Silver",
            "Gold",
            "Platinum",
            "Diamond",
            "Ascendant",
            "Immortal",
            "Radiant"
        ]



        for (const rank of rankList) {
            const role = guild.roles.cache.find(role => role.name === rank);
            if(!role) {
                guild.roles.create({
                    name: rank,
                    color: config.rank_roles[rank],
                    reason: 'Rank role setup'
                })
            }
        }

        interaction.reply({ content: `Rank roles have been set up!`, ephemeral: true })

	},
};