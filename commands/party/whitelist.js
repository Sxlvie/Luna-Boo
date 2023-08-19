const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription('Whitelists selected user')
        .addUserOption(option => option.setName(`target`).setDescription(`Select user to whitelist`).setRequired(true)),
	async execute({ interaction: interaction, db: db }) {
        // enter command here
        let target = interaction.options.getUser('target')
        // Add permissions to the party channel for the user
        let party = db.prepare('SELECT * FROM party WHERE id = ?').get(interaction.user.id);
        if(!party) {
            interaction.reply({ content: `You don't have a party!`, ephemeral: true })
            return;
        }
        let channel = await interaction.guild.channels.fetch(party.channel);
        
        let perms = []
        channel.permissionOverwrites.cache.each(perm => {
            perms.push(perm)
        })

        perms.push({
            type: 1,
            id: target.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
        })

        channel.edit({
            permissionOverwrites: [...perms]
        })

        interaction.reply({ content: `Whitelisted ${target.username}!`, ephemeral: true })

	},
};