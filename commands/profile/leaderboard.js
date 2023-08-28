const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Gives top 10 users with the most xp'),
	async execute({ interaction: interaction, db: db, client: client }) {
        let users = db.prepare('SELECT * FROM users ORDER BY level DESC LIMIT 10').all();
        let usernames = [];
        
        // Bubble sort the users into order using their XP
        // The formula for XP is 15 * level^2 + 100

        for(let i = 0; i < users.length; i++) {

            for(let j = 0; j < users.length - i - 1; j++) {
                // Calculate lifetime XP of user
                let jXp = users[j].xp;
                let jLevel = users[j].level;
                let jLifetimeXP = jXp;

                for(let k = 1; k < jLevel; k++) {
                    jLifetimeXP += 15 * Math.pow(k, 2) + 100;
                }

                let j1Xp = users[j+1].xp;
                let j1Level = users[j+1].level;
                let j1LifetimeXP = j1Xp;

                for(let k = 1; k < j1Level; k++) {
                    j1LifetimeXP += 15 * Math.pow(k, 2) + 100;
                }


                if(jLifetimeXP < j1LifetimeXP) {
                    let temp = users[j];
                    users[j] = users[j+1];
                    users[j+1] = temp;
                }
            }
        }


        console.log(users)

        for(let i = 0; i < users.length; i++) {
            let user = await client.users.fetch(users[i].id);
            usernames.push(user.username);
        }

        console.log(usernames)

        let levels = [];
        let xp = [];
        for(let i = 0; i < users.length; i++) {
            levels.push(users[i].level);
            xp.push(users[i].xp);
        }


        let embed = new EmbedBuilder()
        .setTitle(`Leaderboard`)
        .setDescription(`Here is the leaderboard!`)
        .setColor('#00ff00')
        .setTimestamp()

        for(let i = 0; i < users.length; i++) {
            if(i == 0) embed.addFields({ name: `${i+1}st`, value: `${usernames[i]} - Level ${levels[i]} with ${xp[i]}xp`, inline: false },)
            else if(i == 1) embed.addFields({ name: `${i+1}nd`, value: `${usernames[i]} - Level ${levels[i]} with ${xp[i]}xp`, inline: false },)
            else if(i == 2) embed.addFields({ name: `${i+1}rd`, value: `${usernames[i]} - Level ${levels[i]} with ${xp[i]}xp`, inline: false },)
            else embed.addFields({ name: `${i+1}th`, value: `${usernames[i]} - Level ${levels[i]} with ${xp[i]}xp`, inline: false },)
            
        }
        interaction.reply({ embeds: [embed] });
	},
};