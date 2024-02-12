const dotenv = require('dotenv');
dotenv.config();

const config = require('../config.json');

const apiString = config.api_url + "v1/valorant/by-discord"
const apiKey = process.env.API_KEY

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

async function rankUpdate({ client: client }) {
    console.log('Checking rank...')

    // get all members of the server
    const guild = await client.guilds.cache.get(config.guild_id);
    const members = await guild.members.fetch();

    console.log("Members fetched")
    console.log({apiKey, apiString})

    members.each(user => {
        if(user.user.bot) return;
        console.log(user._roles)

        const roles = user._roles
        const id = user.user.id
        fetch(apiString, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
                'Discord-ID': id
            }
        }).then(res => {
            console.log(res.status)
            if(res.status != 200) return;
            res.json().then(data => {
                console.log(data)
                const rankString = data.currenttierpatched;
                if(!rankString) return;
                const rank = rankString.split(' ')[0];
                console.log({rank})

                if (!rankList.includes(rank)) return;

                guild.roles.fetch().then(guildRoles => {
                    handleRoles(user, rank, guildRoles, roles);
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

const handleRoles = (user, rank, guildRoles, roles) => {
    const newRole = guildRoles.find(role => role.name.toLowerCase() === rank.toLowerCase());
    if(!newRole) {
        console.log(rank + " Role not found");
        return;
    }

    console.log(newRole.name)

    if(!roles.includes(newRole.id)) {
        user.roles.add(newRole);
    }

    // Remove all other rank roles
    roles.forEach(role => {
        if(newRole.name == guildRoles.get(role).name) return;
        if(!rankList.includes(guildRoles.get(role).name)) return;
        console.log(guildRoles.get(role).name)
        user.roles.remove(role);
    })
}
