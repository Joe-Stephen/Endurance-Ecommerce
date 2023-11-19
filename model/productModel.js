const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    regular_price: {
        type: Number,
        required: true,
    },
    selling_price: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
      },
      offerStart: Date,
      offerEnd: Date,
    category: {
        type: String,
        required: true,
    },
    photos: {
        type: Array, // You can store the URL or file path to the product photo
    },
    sizes: [{
        small:{
            type:Number,
            default:0,
        },
        medium:{
            type:Number,
            default:0,
        },
        large:{
            type:Number,
            default:0,
        },
    }],
    status: {
        type: String, // You can use 'Available', 'Out of Stock', etc.
        default:"show",
        required: true,

    },
    // You can add more fields as needed
});

const product = mongoose.model('product', productSchema);

module.exports = product;