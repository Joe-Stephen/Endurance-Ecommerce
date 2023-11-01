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
    category: {
        type: String,
        required: true,
    },
    photos: {
        type: Array, // You can store the URL or file path to the product photo
    },
    stock: {
        type: Number,
        required: true,
    },
    status: {
        type: String, // You can use 'Available', 'Out of Stock', etc.
        default:"unblocked",
        required: true,

    },
    // You can add more fields as needed
});

const product = mongoose.model('product', productSchema);

module.exports = product;