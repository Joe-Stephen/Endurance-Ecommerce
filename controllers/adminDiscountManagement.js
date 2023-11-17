require("dotenv").config();
const user = require("../model/userModel");
const address = require("../model/addressModel");
const razorpay = require("../razorPay");
const razorPay_key_id = process.env.razorPay_key_id;
const razorPay_key_secret = process.env.razorPay_key_secret;
const wallet = require("../model/walletModel");
const order = require("../model/orderModel");
const returns = require("../model/returnModel");
const cancels = require("../model/cancelModel");
const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const twilio_account_sid = process.env.twilio_account_sid;
const twilio_auth_token = process.env.twilio_auth_token;
const twilio_serviceId = process.env.twilio_serviceId;
const twilio = require("twilio")(twilio_account_sid, twilio_auth_token);
const product = require("../model/productModel");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const cart = require("../model/cartModel");
const wishlist = require("../model/wishlistModel");
const coupon = require("../model/couponModel");
const banner = require("../model/bannerModel");
const Category = require("../model/categoryModel");

//rendering discount management page
const getDiscountManagement= async (req, res)=>{
    try{
        res.render("adminDiscountManagement")

    } catch (err) {
        console.log("An error happened while loading the discount page! :" + err);
        res.status(500).render("error-page", {
          message: "Error retrieving discount management!",
          errorMessage: err.message,
        });
      }
};

//add discount page
const getAddDiscount= async (req, res)=>{
    try{
        const products= await product.find()
        const categories= await Category.find()

        res.render("adminAddDiscount", {products, categories});

    } catch (err) {
        console.log("An error happened while loading the add discount page! :" + err);
        res.status(500).render("error-page", {
          message: "Error loading add discount page!",
          errorMessage: err.message,
        });
      }
};


module.exports = {
    getDiscountManagement,
    getAddDiscount,
};
