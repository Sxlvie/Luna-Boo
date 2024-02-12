const config = require('../config.json');

async function xpAdd({ db: db, id: id, xp: xp, client: client, guild: guild}) {


    const channel = await client.channels.cache.get(config.level_channel_id);
    const user = await client.users.cache.get(id);

    // Get member instead of user
    const member = guild.members.cache.get(id)

    // Check if user exists

    const userExists = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if(!userExists) {
        db.prepare('INSERT INTO users (id, xp, level) VALUES (?, ?, ?)').run(id, 0, 1);
        return;
    }

    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xp, id);
    
    const level = userExists.level;
    const newXP = userExists.xp + xp;
    
    const { level: newLevel, xp: newXP2 } = calculateLevel(level, newXP);

    if (newLevel === level) return;

    db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXP2, newLevel, id);
    if(!member) {
        channel.send(`${user.displayName} has leveled up to level ${newLevel} from ${level}!`);
    } else {
        channel.send(`${member.displayName} has leveled up to level ${newLevel} from ${level}!`);
    }
    
}

module.exports = {
    xpAdd
}

const calculateLevel = (level, xp) => {
    let nextLevel = 15 * Math.pow(level, 2) + 100;
    while (xp >= nextLevel) {
        level++;
        xp -= nextLevel;
        nextLevel = 15 * Math.pow(level, 2) + 100;
    }

    return {
        level,
        xp
    }
}