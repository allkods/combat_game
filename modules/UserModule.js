var mongoose=require('mongoose');

var userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:false 
    },
    provider : {
        type:String,
        default : "local",
    },
    type:{
        type:String,
        default:'user'
    },
    date:{
        type:Date,
        default:Date.now()
    },
    isVerified : {
        type : Boolean,
        default : false,
        required : true
    },
    character:{
        type:String,
        required:false
    }
});

const User=mongoose.model('users', userSchema);
module.exports=User;