const { Client, VoiceState, User, Guild } = require('discord.js');
const config = require('../config.json');
const { xpAdd } = require('./xpAdd');
const { Database } = require('better-sqlite3');   


/**
 * 
 * @param { Client } client 
 * @param { VoiceState } oldState 
 * @param { VoiceState } newState 
 * @param { Database } db 
 * @returns { void } 
 */
const handleVC = (client, oldState, newState, db) => {
    if (oldState.member.user.bot) return;
    stateHandler(oldState, newState, db);
}

/**
 * @param { User } user 
 * @param { Client } client
 * @param {Guild} guild
 * @param { Database } db
 * @returns { boolean }
 */
const updateXP = (user, client, guild, db) => {
    const time = Date.now();
    const timeSpent = time - user.time;
    
    const xp = Math.floor(timeSpent / 30000);
    xpAdd({ id: user.id, xp: xp, db: db, client: client, guild: guild });
    return true;
}

/**
 * @param { VoiceState } oldState
 * @param { VoiceState } newState
 * @param { Database } db
 * @returns { void }
 */ 
const stateHandler = (oldState, newState) => {
    // Check if the user joined or left a voice channel in specified guild
    if(oldState.guild.id != config.guild_id && newState.guild.id != config.guild_id) return;

    // Check if the user joined a VC from somewhere else
    if (oldState.guild.id != config.guild_id && newState.guild.id == config.guild_id){
        if (newState.channelId != null) joinVC(newState, db);
    } 

    // Check if the user left a VC from the specified guild
    else if (oldState.guild.id == config.guild_id && newState.guild.id != config.guild_id){
        leaveVC(oldState, db);
    }

}   

/**
 * 
 * @param {VoiceState} newState
 * @param {Database} db
 * @returns 
 */
const joinVC = (newState, db) => {
    let id = newState.member.id;
    let time = Date.now();
    let user = db.prepare('SELECT * FROM voice WHERE id = ?').get(id);

    if(user) {
        db.prepare('UPDATE voice SET time = ? WHERE id = ?').run(time, id);
        return;
    }

    db.prepare('INSERT INTO voice (id, time) VALUES (?, ?)').run(id, time);
}

/**
 * 
 * @param {VoiceState} oldState 
 * @param {Database} db
 * @returns 
 */
const leaveVC = (oldState, db) => {
    let id = oldState.member.id;
    let user = db.prepare('SELECT * FROM voice WHERE id = ?').get(id);

    if(user) updateXP(user, client, oldState.guild, db);

    let channel = oldState.channel;
    if(channel.members.size == 0) handlePartyClose(channel, db);
}

/**
 * @param {import('discord.js').Channel} channel
 * @param {Database} db
 * @returns {void}
 */  
const handlePartyClose = (channel, db) => {
    let party = db.prepare('SELECT * FROM party WHERE channel = ?').get(channel.id);
    if(party) {
        db.prepare('DELETE FROM party WHERE channel = ?').run(channel.id);
        channel.delete();
    }
}  

module.exports = handleVC;