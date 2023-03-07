const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    id: Number,
    lastPack: Number,
    coins: Number,
    cards: Array,
}, { collection: 'users'})

const User = mongoose.model('User', userSchema)

module.exports = {
    User
}