const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    _id: { // the _ before id means, this is the only id and mongoos will not create auto id.
        type: String,
        required: true
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