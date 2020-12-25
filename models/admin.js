const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String
    },
    pass: {
        type: String
    },
    about: {
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
    },
    mail: {
        type: Array
    },
    profile: {
        title: {
            type: String
        },
        body: {
            type: String
        },
        commentName: {
            type: String
        },
        commentPicture: {
            type: String
        }
    },
    notifications: {
        receiveNotifications: {
            type: Boolean,
        },
        comments: {
            type: Boolean
        },
        myReplies: {
            type: Boolean
        },
        otherReplies: {
            type: Boolean
        },
        registeredUsers: {
            type: Boolean
        },
        usersReceiveNotifications: {
            type: Boolean
        }
    },
    security: {
        twoStepVerification: {
            type: Boolean
        },
        securityCode: {
            type: Boolean
        },
        securityQuestion: {
            type: Boolean
        },
        securityQuestionQuestion: {
            type: String
        },
        securityQuestionAnswer: {
            type: String
        }
    },
    followers: {
        type: Array
    }
});

module.exports = mongoose.model('Admin', adminSchema);