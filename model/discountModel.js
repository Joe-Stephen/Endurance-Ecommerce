const mongoose = require('mongoose');

const discountSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  discountOn: {
    type: String,
    enum: ['product', 'category', 'brand'],
    required: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixedAmount'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  maxRedeemableAmt:{
    type: Number,
    default:0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: String,
    default: "Active",
  },
  discountedProducts:[{
    type : mongoose.Schema.Types.ObjectId,
    ref:'product'
}],
discountedCategories:[{
    type : mongoose.Schema.Types.ObjectId,
    ref:'Category'
}],
discountedBrands:[{
    type : mongoose.Schema.Types.ObjectId,
    ref:'brand'
}],
});

const discount = mongoose.model('discount', discountSchema);
module.exports = discount;
