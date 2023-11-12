const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  orderId: {
    type: String,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      size:{
        type:String,
        required:true,
      },
    },
  ],
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderAddress: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ["Placed", "Shipped", "Delivered", "Cancelled", "Returned"],
    default: "Placed",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Success", "Failed", "Refunded"],
    default: "Pending",
  },
  appliedCoupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "coupon",
  },
  paymentMethod: {
    type: String,
    required: true,
  },
});

const order = mongoose.model("order", orderSchema);
module.exports = order;
