
async function xpAdd({ db: db, id: id, xp: xp, client: client, }) {

    const channel = await client.channels.cache.get(process.env.LEVEL_CHANNEL_ID);
    const user = await client.users.cache.get(id);

    // Check if user exists

    const userExists = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if(!userExists) {
        db.prepare('INSERT INTO users (id, xp, level) VALUES (?, ?, ?)').run(id, 0, 1);
        return;
    }

    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xp, id);
    
    const level = userExists.level;
    const newXP = userExists.xp;
    const nextLevel = level * 300;
    if(newXP >= nextLevel) {
        db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(0, level + 1, id);
        channel.send(`${user} has leveled up to level ${level + 1}!`);
    }
}

module.exports = {
    xpAdd
}