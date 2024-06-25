const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    }
     ,
    password : {
        type : String,
        required : true
    },

    mailToken : {
        type : String
    },

    mailTokenExpire : {
        type : Date
    },
    
    phone :{
        type: Number,
        required : true
    },

    website : {
        type : String,
    },

    address : {
        type : String,
    },

    city : {
        type : String,
    },
    state : {
        type : String,
    },

    country : {
        type : String,
    },

    zipcode : {
        type : String,
    }

})

module.exports = mongoose.model('User',userSchema);
