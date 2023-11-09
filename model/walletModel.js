const mongoose = require('mongoose');
const walletSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    amount : {
        type : Number
    }
})
const  wallet = mongoose.model(' wallet',walletSchema);
module.exports = wallet;