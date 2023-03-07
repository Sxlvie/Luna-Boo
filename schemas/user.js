const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    id: Number,
    lastPack: String,
    coins: Number,
    cards: Array,
}, { collection: 'index'})

const User = mongoose.model('User', userSchema)

module.exports = {
    User
}