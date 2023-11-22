const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  discount: {
    type: Number,
    default: 0,
  },
  discountType:{
    type:String,
  },
  maxRedeemableAmt:{
    type:Number,
  },
  offerStart: Date,
  offerEnd: Date,
  discountStatus:{
    type: String,
    default:"Active",
  },
  status: {
    type: String,
    default: 'Active',
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
