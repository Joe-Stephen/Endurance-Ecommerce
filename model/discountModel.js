const mongoose = require("mongoose");

const discountSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  discountOn: {
    type: String,
    enum: ["product", "category"],
    required: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixedAmount"],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  maxRedeemableAmt: {
    type: Number,
    default: 0,
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
  discountedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
  },
  discountedCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});

const discount = mongoose.model("discount", discountSchema);
module.exports = discount;
