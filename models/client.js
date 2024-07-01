const { timeStamp } = require('console');
const mongoose = require('mongoose');

const clientSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    }
     ,
    phone :{
        type: Number,
        required : true
    },

    business : {
        type : String,
        required : true
    },

    address : {
        type : String,
        required : true
    },

    city : {
        type : String,
        required : true
    },
    state : {
        type : String,
        required : true
    },

    country : {
        type : String,
        required : true
    },

    zipcode : {
        type : String,
        required : true
    },

    userID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    stuff: [{
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalunitPrice: { type: Number, required: true }
      }],
    subtotal : {
        type : Number,
        required : true
    },
    tax:{
        type : Number,
        required : true
    },
    totalPrice : {
        type : Number,
        required : true
    },

    dateOfIssue : {
        type : String,
        required : true
    },

    invoiceNumber : {
        type : String
    },

    pdf : {
        type : Buffer
    }
}, {timestamps : true})

module.exports = mongoose.model('Client',clientSchema);

