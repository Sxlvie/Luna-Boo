const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Gives top 10 users with the most xp'),
	async execute({ interaction: interaction, db: db, client: client }) {
        let users = db.prepare('SELECT * FROM users ORDER BY level DESC LIMIT 10').all();
        let usernames = [];
        
        // Bubble sort the users into order using their level * 300 + xp
        for(let i = 0; i < users.length; i++) {
            for(let j = 0; j < users.length - i - 1; j++) {
                if(users[j].level * 300 + users[j].xp < users[j + 1].level * 300 + users[j + 1].xp) {
                    let temp = users[j];
                    users[j] = users[j + 1];
                    users[j + 1] = temp;
                }
            }
        }
        console.log(users)

        for(let i = 0; i < users.length; i++) {
            let user = await client.users.fetch(users[i].id);
            usernames.push(user.username);
        }

        // Check if there's less than 10 users
        if(users.length < 10) {
            // Add empty fields
            for(let i = users.length; i < 10; i++) {
                usernames.push('None');
            }
        }

        console.log(usernames)

        let levels = [];
        let xp = [];
        for(let i = 0; i < users.length; i++) {
            levels.push(users[i].level);
            xp.push(users[i].xp);
        }

        if(users.length < 10) {
            // Add empty fields
            let empty = 10 - users.length;
            for(let i = 0; i < empty; i++) {
                levels.push('0');
                xp.push('0');
            }
        }


        let embed = new EmbedBuilder()
        .setTitle(`Leaderboard`)
        .setDescription(`Here is the leaderboard!`)
        .setColor('#00ff00')
        .setTimestamp()
        .addFields(
            { name: '1st', value: `${usernames[0]} - Level ${levels[0]} with ${xp[0]}xp`, inline: false },
            { name: '2nd', value: `${usernames[1]} - Level ${levels[1]} with ${xp[1]}xp`, inline: false },
            { name: '3rd', value: `${usernames[2]} - Level ${levels[2]} with ${xp[2]}xp`, inline: false },
            { name: '4th', value: `${usernames[3]} - Level ${levels[3]} with ${xp[3]}xp`, inline: false },
            { name: '5th', value: `${usernames[4]} - Level ${levels[4]} with ${xp[4]}xp`, inline: false },
            { name: '6th', value: `${usernames[5]} - Level ${levels[5]} with ${xp[5]}xp`, inline: false },
            { name: '7th', value: `${usernames[6]} - Level ${levels[6]} with ${xp[6]}xp`, inline: false },
            { name: '8th', value: `${usernames[7]} - Level ${levels[7]} with ${xp[7]}xp`, inline: false },
            { name: '9th', value: `${usernames[8]} - Level ${levels[8]} with ${xp[8]}xp`, inline: false },
            { name: '10th', value: `${usernames[9]} - Level ${levels[9]} with ${xp[9]}xp`, inline: false },
        )
        interaction.reply({ embeds: [embed] });
	},
};