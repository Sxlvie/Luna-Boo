const { PermissionFlagsBits } = require('discord-api-types/v9');

async function whitelist({ user: user, channel: channel, interaction: interaction }) {

    let perms = []
    channel.permissionOverwrites.cache.each(perm => {
        perms.push(perm)
    })

    console.log({user})

    // Support for multiple users
    if(Array.isArray(user)) {
        console.log('is array')

        // Get user if we only have the ID
        for(let i = 0; i < user.length; i++) {
            if(typeof user[i] === 'string') {
                user[i] = await interaction.guild.members.fetch(user[i]);
            }
        }

        for(const u of user) {
            perms.push({
                type: 1,
                id: u.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
            })
        }
        channel.edit({
            permissionOverwrites: [...perms]
        })
        


        // DM the user that they've been whitelisted
        for(const u of user) {
            u.send({ content: `You've been whitelisted in server VC; ${channel.name}!` })
        }

    } else {
        console.log('is not array')
        
        // Get user if we only have the ID
        if(typeof user === 'string') {
            user = await interaction.guild.members.fetch(user);
        }
    
    
        perms.push({
            type: 1,
            id: user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
        })
    
        channel.edit({
            permissionOverwrites: [...perms]
        })
    
        // DM the user that they've been whitelisted
        user.send({ content: `You've been whitelisted in server VC; ${channel.name}!` })
    }


}

module.exports = whitelist;