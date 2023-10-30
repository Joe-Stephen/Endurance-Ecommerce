const mongoose = require('mongoose');

const cancelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    cancelDate:{
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
            enum:["change_contact_number", "change_payment", "delivery_time_long", "change_ship_address"],
            require:true,
        }
    }]
});

const cancels = mongoose.model('cancels', cancelSchema);
module.exports = cancels;