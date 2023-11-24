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
        sizes: {
            small: {
                type: Number,
                default: 0,
            },
            medium: {
                type: Number,
                default: 0,
            },
            large: {
                type: Number,
                default: 0,
            },
        },
        quantity: {
            type: Number,
            default: 0,
        },
    }]
});

const cart = mongoose.model("cart", cartSchema);

module.exports = cart;