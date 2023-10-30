const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
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
    },
  ],
  orderDate: {
    type: Date,
    default: Date.now,
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
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  paymentMethod: {
    type: String, // You can define the data type for the payment method (e.g., "Credit Card", "PayPal", etc.)
    required: true, // You can set this to "true" if the payment method is mandatory
  },
});

const order = mongoose.model("order", orderSchema);
module.exports = order;
