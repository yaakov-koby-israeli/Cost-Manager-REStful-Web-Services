const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CostSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    category: {
        type: String, // "food", "health", "housing", "sport", "education"
        enum: ['food', 'health', 'housing', 'sport', 'education'],
        required: true
    },
    userid: {
        type: String,
        required: true
    },
    sum: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now // אם לא מגיע מהלקוח, יתווסף אוטומטית
    }
});
const Cost = mongoose.model('costs', CostSchema); // מחזירה רפרנס לאובייקט שהוא בעצם קונסטרקטור פאנקשן

module.exports = Cost;