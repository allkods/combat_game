var mongoose=require('mongoose');

var tokenSchema= new mongoose.Schema({
    id:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:true
    },
    created: {
        type: Date,
        default: () => Date.now()
    },
    expire_at: { type: Date, default: Date.now, expires: 60 }
});

const Token=mongoose.model('tokens', tokenSchema);
module.exports=Token;