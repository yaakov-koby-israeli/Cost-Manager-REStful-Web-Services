const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CostSchema = new Schema({
    description: {
        type: String
    },
    category: {
        type: String, // "food", "health", "housing", "sport", "education"
        enum: ['food', 'health', 'housing', 'sport', 'education']
    },
    userid: {
        type: String
    },
    sum: {
        type: Number
    }
});
const Cost = mongoose.model('costs', CostSchema);

module.exports = Cost;