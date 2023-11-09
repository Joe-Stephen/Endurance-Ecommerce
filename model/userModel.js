const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        unique:true,
        type:String,
        required:true        
    },
    isVerified:{
        type:Number,
        // required:true
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    status:{
        type:String,
    },
    createdOn:{
        type: Date,
        default: Date.now,
    },
    walletBalance:{
        type:Number,
        default:0,
    },
});

const user=mongoose.model("user",userSchema);

module.exports=user;