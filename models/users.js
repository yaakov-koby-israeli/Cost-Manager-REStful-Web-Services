const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    id: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
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