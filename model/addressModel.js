const mongoose=require("mongoose")

const addressSchema=new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    address: [{
        addressType:{
            type:String,
            required:true,
        },
        userName:{
            type:String,
            required:true,
        },
        city:{
            type:String,
            required:true,
        },
        landMark:{
            type:String,
        },
        state:{
            type:String,
            required:true,
        },
        pinCode:{
            type:Number,
            required:true,
        },
        altPhone:{
            type:Number,
        },
        
}]
});

const address=mongoose.model("address",addressSchema);

module.exports=address;