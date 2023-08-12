const dotenv = require('dotenv');
dotenv.config();

const apiString = "https://valorant.aesirdev.tech/api/bot/profile"
const apiKey = process.env.API_KEY

const rankList = [
    "Unranked",
    "Iron",
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Immortal",
    "Radiant"
]

async function rankUpdate({ client: client }) {
    console.log('Checking rank...')

    // get all members of the server
    const guild = await client.guilds.cache.get(process.env.GUILD_ID);
    const members = await guild.members.fetch();

    console.log("Members fetched")
    console.log({apiKey, apiString})

    members.each(user => {
        if(user.user.bot) return;
        console.log(user._roles)

        const roles = user._roles
        const id = user.user.id
        fetch(apiString, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "TEST"
            },
            body: JSON.stringify({
                "user_id": `${id}`
            })
        }).then(res => {
            console.log(res.status)
            if(res.status != 200) return;
            res.json().then(data => {
                console.log(data)
                const rankString = data.currentTierPatched;
                if(!rankString) return;
                console.log(rankString);
                let rank = rankString.split(' ')[0];
                console.log(rank);

                guild.roles.fetch().then(guildRoles => {
                    const role = guildRoles.find(role => role.name === rank);
                    console.log(role.id)
                    if(!roles.includes(role.id)) {
                        user.roles.add(role);
                        console.log(role.id)
                        let newRole = role

                        // Remove all other rank roles
                        roles.forEach(role => {
                            
                            if(newRole.name == guildRoles.get(role).name) return;
                            if(!rankList.includes(guildRoles.get(role).name)) return;
                            console.log(guildRoles.get(role).name)
                            user.roles.remove(role);
                        })
                    }
                })
            }
            )
        })
        

    })

    setTimeout(rankUpdate, 600000, { client: client });
}   

module.exports = {
    rankUpdate
}
