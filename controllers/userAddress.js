require("dotenv").config();
const user = require("../model/userModel");
const address = require("../model/addressModel");
const razorpay= require("../razorPay"); 
const razorPay_key_id= process.env.razorPay_key_id;
const razorPay_key_secret= process.env.razorPay_key_secret;
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

//getting add address
const getAddAddress = (req, res) => {
    res.render("addressCreation");
  };
  
  //saving address
  const postAddAddress = async (req, res) => {
    try {
      const userData = await user.findOne({ email: req.user });
      let userAddress = await address.findOne({ userId: userData._id });
  
      // Retrieve data from the request body
      const {
        addressType,
        userName,
        city,
        landmark,
        state,
        pincode,
        phoneNumber,
        altPhoneNumber,
      } = req.body;
  
      if (userAddress) {
        userAddress.address.push({
          addressType,
          userName,
          city,
          landmark,
          state,
          pincode,
          phoneNumber,
          altPhoneNumber,
        });
  
        // Save the updated userAddress document
        await userAddress.save();
      } else {
        // Create a new address document
        const newAddress = new address({
          userId: userData._id,
          address: {
            addressType,
            userName,
            city,
            landmark,
            state,
            pincode,
            phoneNumber,
            altPhoneNumber,
          },
        });
  
        // Save the new address document to the database
        await newAddress.save();
      }
  
      // Redirect to a success page or send a success response
      res.redirect("/userAccount");
    } catch (err) {
      console.error("Error while saving address:", err);
      // Handle the error and send an error response
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };
  
  //edit address
  const getEditAddress = async (req, res) => {
    try {
      const userData = await user.findOne({ email: req.user });
      const userAddress = await address.findOne({ userId: userData._id });
      let newAddress;
      userAddress.address.forEach((address) => {
        if (address._id == req.query.addressId) {
          newAddress = address;
        }
      });
      res.render("editAddress", { newAddress });
    } catch (err) {
      console.log("An error");
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };
  
  //post edit address
  const postEditAddress = async (req, res) => {
    try {
      const addressId = req.body.addressId;
      const addressType = req.body.addressType;
      const userName = req.body.userName;
      const city = req.body.city;
      const landmark = req.body.landmark;
      const state = req.body.state;
      const pincode = req.body.pincode;
      const phoneNumber = req.body.phoneNumber;
      const altPhone = req.body.altPhone;
      const userData = await user.findOne({ email: req.user });
      const userAddress = await address.findOne({ userId: userData._id });
      let newAddress;
      userAddress.address.forEach((address) => {
        if (address._id == addressId) {
          newAddress = address;
        }
        newAddress.addressType = addressType;
        newAddress.userName = userName;
        newAddress.city = city;
        newAddress.state = state;
        newAddress.pincode = pincode;
        newAddress.phoneNumber = phoneNumber;
        newAddress.altPhone = altPhone;
        newAddress.userData = userData;
      });
      await newAddress.save();
      res.redirect("/userAccount");
    } catch (err) {
      console.log(err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };

module.exports = {
    getAddAddress,
    postAddAddress,
    getEditAddress,
    postEditAddress, 
  };