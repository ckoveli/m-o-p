const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    date: {
        type: String
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String
    },
    preview: {
        type: String
    },
    body: {
        type: String,
        required: true
    },
    picture: {
        type: String
    },
    commentsEnabled: {
        type: Boolean
    },
    comments: {
        type: Array
    },
    slug:{
        type: String,
        unique: true
    }
});

module.exports = mongoose.model('Post', postSchema);