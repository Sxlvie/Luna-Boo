const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema({
    name: String,
    url: String,
    rarity: String,
    id: Number
}, { collection: 'index'})

const Waifu = mongoose.model('Waifu', cardSchema)

module.exports = {
    Waifu
}