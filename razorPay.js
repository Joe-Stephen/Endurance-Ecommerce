const razorpay= require("razorpay");
require("dotenv").config();
const razorPay_key_id= process.env.razorPay_key_id;
const razorPay_key_secret= process.env.razorPay_key_secret;
const razorpayInstance= new razorpay({
    key_id:razorPay_key_id,
    key_secret:razorPay_key_secret,
});

module.exports = razorpayInstance;