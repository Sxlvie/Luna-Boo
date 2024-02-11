const { SlashCommandBuilder, EmbedBuilder, Embed, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const config = require('../../config.json');

const rankColors = {
    "Bronze": "#cd7f32",
    "Silver": "#c0c0c0",
    "Gold": "#ffd700",
    "Platinum": "#e5e4e2",
    "Diamond": "#b9f2ff",
    "Ascendant": "#1e8a51",
    "Immortal": "#4b0082",
    "Radiant": "#ff0000"
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Replies with profile stats')
        .addUserOption(option => option.setName(`target`).setDescription(`Find user's profile`).setRequired(false)),
	async execute({ interaction: interaction, db: db }) {
        // enter command here
        await interaction.deferReply()

        let user = interaction.user;
        if(interaction.options.getUser('target')) {
            user = interaction.options.getUser('target');
        }
        
        // Use the banner from the API
        const res = await fetch(`${config.api_url}v1/valorant/by-discord`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.API_KEY,
                'Discord-ID': user.id
            }
        })

        const data = await res.json();
        console.log(data)

        // Error handling
        if(res.status != 200) {
            interaction.editReply({ content: `Error: ${data.error}`, ephemeral: true })
            return;
        }

        // Get data from DB
        const userExists = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
        if(!userExists) {
            db.prepare('INSERT INTO users (id, xp, level) VALUES (?, ?, ?)').run(user.id, 0, 1);
            interaction.editReply({ content: `Profile doesn't exist, made a new one.`, ephemeral: true })
            return;
        }
        
        // Create a canvas
        const canvas = Canvas.createCanvas(268, 640);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage(data.banner.large);
        // Dim the background
        ctx.globalAlpha = 0.5;

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        // Write the gamename on the canvas
        ctx.font = '35px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = "center";
        ctx.fillText(`${data.name}#${data.tag}`, 134, 40);

        // Write the level on the canvas
        ctx.font = '30px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = "center";
        ctx.fillText(`Level ${userExists.level}`, 134, 100);
        ctx.fillText(`${userExists.xp} XP`, 134, 130);

        // Write the rank on the canvas
        ctx.font = '30px sans-serif';
        ctx.textAlign = "center";

        // Change fillStyle based on rank color
        let rankCut = data.currenttierpatched.split(' ');
        ctx.fillStyle = rankColors[rankCut[0]];

        ctx.fillText(`${data.currenttierpatched}`, 134, 190);

        // Add rank image to canvas
        const rank = await Canvas.loadImage(data.currentrankimage);
        console.log(rank.naturalWidth)
        ctx.drawImage(rank, 134-(250/2), 240, 250, 250);


        // Send the image
        const attachment = new AttachmentBuilder(canvas.toBuffer(), 'profile.png');
        interaction.editReply({ files: [attachment]})
	},
};