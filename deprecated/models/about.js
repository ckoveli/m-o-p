const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    title: {
        type: String
    },
    subtitle: {
        type: String
    },
    body: {
        type: String
    },
    picture: {
        type: String
    }
});

module.exports = mongoose.model('About', aboutSchema);