const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    userId:{
        type:String,
        index:true,
        unique:true
    },
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    password:{
        type:String,
        default:'password'
    },
    email:{
        type:String,
        default:''
    },
    mobileNumber:{
        type:Number,
        default:0
    },
    groups:[],
    createdOn:{
        type:String,
        default:''
    }
});

mongoose.model('User',userSchema);