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
      discountStatus:{
        type: String,
        default:"Active",
      },
    category: {
        type: String,
        required: true,
    },
    photos: {
        type: Array, 
    },
    sizes:{
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
    },
    status: {
        type: String, 
        default:"show",
        required: true,

    },
});

const product = mongoose.model('product', productSchema);

module.exports = product;