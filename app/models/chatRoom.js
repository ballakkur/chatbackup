const mongoose = require('mongoose');

const Room = new mongoose.Schema({
    roomId:{
        type:String,
        index:true,
        default:'',
        unique:true
    },
    roomSubject:{
        type:String,
        default:'New Group'
    },
    createdOn:{
        type:Date,
        default:Date.now
    },
    active:{
        type:Boolean,
        default:true
    },
    admin:{},
    members:[]
});
mongoose.model('Room',Room);