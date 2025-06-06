/**
 * User model schema.
 * Represents a user with ID, first name, last name, birthday, and marital status.
 * @module models/User
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    id: {
        type: Number,
        required: true,
        min: 1
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    birthday: {
        type: Date
    },
    marital_status: {
        type: String
    }
});

const User = mongoose.model('users', UserSchema);

module.exports = User;