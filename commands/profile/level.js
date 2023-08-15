const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Replies with your level'),
	async execute({ interaction: interaction, db: db }) {
        // enter command here
		const user = interaction.user;
        const id = user.id;

        const userExists = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if(!userExists) {
            interaction.reply('You are level 0 with 0xp');
            return;
        }

        const xp = userExists.xp;
        const level = userExists.level;
        interaction.reply(`You are level ${level} with ${xp}xp`);

	},
};