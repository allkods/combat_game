var mongoose=require('mongoose');

var roomSchema= new mongoose.Schema({
    room_id:{
        type:String,
        required:true
    },
    created_by:{
        type:String,
        required:false 
    },
    players:{
        type:Array,
        required:false
    },
    stat:{
        type:String,
        default:"inactive"
    },
    date:{
        type:Date,
        default:Date.now()
    }
});

const Room=mongoose.model('rooms', roomSchema);
module.exports=Room;