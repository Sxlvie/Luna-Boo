const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');
const whitelistPrompt = require('../../modules/whitelistPrompt');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('partycreate')
		.setDescription('Makes a party with accompanying VC'),
	async execute({ interaction: interaction, db: db, client: client }) {
        // enter command here

        // Create a party using DB 
        const member = interaction.member;
        const guild = interaction.guild;

        // Check if user already has a party
        const party = db.prepare('SELECT * FROM party WHERE id = ?').get(interaction.user.id)
        if (party) {
            interaction.reply({content: 'You already have a party!', ephemeral: true})
            return
        }
        
        // Get the @everyone role to make the VC private
        guild.roles.fetch().then(guildRoles => {
            const role = guildRoles.find(r => r.name === '@everyone')
            guild.channels.create({
                name: `${member.user.username}'s party`,
                type: ChannelType.GuildVoice,
                parent: config.party_category_id,
                position: 0,
                permissionOverwrites: [
                    {
                        type: 1,
                        id: member.user.id,
                        allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                    },
                    {
                        type: 0,
                        id: role.id,
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
    
                    }
                ]
            }).then(channel => {

                db.prepare('INSERT INTO party (id, channel, time) VALUES (?, ?, ?)').run(interaction.user.id, channel.id, Date.now())
                interaction.reply({ content: 'Party created, you have 2 minutes to join the VC before it gets deleted.', ephemeral: true })
                .then(() => {
                    whitelistPrompt({ interaction: interaction, party: party })
                })
                

                // Check if VC is empty after 2 min
                setTimeout(() => {

                    // Check if user still has a party
                    const party = db.prepare('SELECT * FROM party WHERE id = ?').get(interaction.user.id)
                    if (!party) return

                    let firstMember = channel.members.keyAt(0)
                    if (!firstMember) {
                        channel.delete()
                        db.prepare('DELETE FROM party WHERE id = ?').run(interaction.user.id)
                    }
                }, 120000)
            })

        })

        

        
	},
};
