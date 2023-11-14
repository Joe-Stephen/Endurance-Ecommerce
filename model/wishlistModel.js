const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    products: [{
        productId: {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "product"
        },
        quantity: {
            type: Number,
        },
    }]
});

const wishlist = mongoose.model("wishlist", wishlistSchema);

module.exports = wishlist; 