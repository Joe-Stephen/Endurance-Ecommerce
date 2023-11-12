const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        size:{
            type:String,
            },
        quantity: {
            type: Number,
        },
    }]
});

const cart = mongoose.model("cart", cartSchema);

module.exports = cart; 