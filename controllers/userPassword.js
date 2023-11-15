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

//getting forgot password page
const getForgotPassword = (req, res) => {
    res.render("forgot-Password");
  };
  
  //sending forget password otp
  const getResetPasswordOtp = async (req, res) => {
    try {
      const userData = await user.findOne({ email: req.body.email });
      if (!userData) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const phoneNumber = userData.phoneNumber;
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number not available" });
      }
  
      await twilio.verify.v2.services(twilio_serviceId).verifications.create({
        to: `+91${phoneNumber}`,
        channel: "sms",
      });
  
      const response = {
        phoneNumber: phoneNumber,
      };
      return res.json(response);
    } catch (err) {
      console.error("An error happened while sending the OTP: " + err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };
  
  //verifying forgot password otp
  const verifyForgotPasswordOtp = async (req, res) => {
    try {
      const phoneNumber = req.body.phoneNumber;
      const otp = req.body.otpCode;
      const verifyOTP = await twilio.verify.v2
        .services(twilio_serviceId)
        .verificationChecks.create({
          to: `+91${phoneNumber}`,
          code: otp,
        });
      if (verifyOTP.valid) {
        console.log("VERIFIED");
      }
    } catch (err) {
      console.log("An error occured " + err);
      res.render("forgot-password");
    }
  };
  
  const getResetPassword = (req, res) => {
    let phoneNumber = req.params.phoneNumber;
    res.render("resetPassword", { phoneNumber });
  };
  
  // Update the user's password
  const changePassword = async (req, res) => {
    try {
      const phoneNumber = req.body.phoneNumber;
      console.log("number " + phoneNumber);
      console.log("new pass " + req.body.password1);
  
      // Hash the new password
      bcrypt.hash(req.body.password1, 10, async (err, hash) => {
        if (err) {
          console.error("Error hashing the password: " + err);
          res
            .status(500)
            .json({ error: "An error occurred while changing the password" });
        } else {
          // Update the user's password with the hashed value using findOneAndUpdate
          await user.findOneAndUpdate(
            { phoneNumber: phoneNumber },
            { $set: { password: hash } }
          );
          console.log("Password updated successfully");
          res.redirect("/getLogin");
        }
      });
    } catch (err) {
      console.error("An error occurred while changing the password: " + err);
      res.status(500).render("error-page", { message: "An error occurred while changing the password !", errorMessage: err.message });
    }
  };

module.exports = {
    getForgotPassword,
    getResetPasswordOtp,
    verifyForgotPasswordOtp,
    getResetPassword,
    changePassword,    
  };
