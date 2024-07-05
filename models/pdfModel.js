const mongoose = require('mongoose');

const pdfModel = mongoose.Schema({

    clientID : {
        type : String
    },

    userID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },

    pdfData : {
        type : Buffer
    }
})

module.exports = mongoose.model('pdfModel',pdfModel);