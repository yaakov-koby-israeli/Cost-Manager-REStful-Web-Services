const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CostSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['food', 'health', 'housing', 'sport', 'education'],
        required: true
    },
    userid: {
        type: Number,
        required: true,
        min: 1
    },
    sum: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});
const Cost = mongoose.model('costs', CostSchema);

module.exports = Cost;