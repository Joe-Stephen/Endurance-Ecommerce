const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    returnDate:{
        type: Date,
        default: Date.now,
    },
    orders: [{
        orderId: {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "order",
            required: true,
        },
        reason: {
            type: String,
            enum:["MISSHIPMENT", "DAMAGED_PRODUCT", "MISSING_ITEM", "ITEM_NOT_AS_DESCRIBED"],
            require:true,
        }
    }]
});

const returns = mongoose.model('returns', returnSchema);
module.exports = returns;
