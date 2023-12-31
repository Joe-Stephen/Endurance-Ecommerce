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
    referralCode:{
        type:String,
        required:true,
    },
    redeemed:{
        type:Boolean,
        default:false,
    },
    redeemedUsers:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    }
],
    walletBalance:{
        type:Number,
        default:0,
    },
});

const user=mongoose.model("user",userSchema);

module.exports=user;