const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
  code: {
    type: String,
    unique: true,
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
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  maxRedeemableAmt:{
    type: Number,
    default:0,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: String,
    default: "Active",
  },
  redeemedUsers:[{
    type : mongoose.Schema.Types.ObjectId,
    ref:'user'
}],
});

const coupon = mongoose.model('coupon', couponSchema);
module.exports = coupon;
