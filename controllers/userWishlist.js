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

//wishlist
const getWishlist= async (req, res)=>{
    try{
      const loggedIn = req.user ? true : false;
      const userData= await user.findOne({email:req.user});
      const userWishlist = await wishlist.findOne({ userId: userData._id }).populate({
        path: "products.productId",
        model: "product",
      }); 
      res.render("wishlist", { userWishlist, loggedIn });
    } catch (err) {
      console.error("Error while loading wishlist:", error);
      // Handle the error as needed
    }
    };
  
  
  //add to wishlist
  const addToWishlist = async (req, res) => {
    try {
      const loggedIn = req.user ? true : false;
      const productId = req.body.productId;
      const userData = await user.findOne({ email: req.user });
      let userWishlist = await wishlist
        .findOne({ userId: userData._id });
  
        if (userWishlist) {
          const existingProduct = userWishlist.products.find(
            (product) => product.productId.toString() === productId
          );
    
          if (existingProduct) {
            return res.status(500).json({ message: "Product already in the Wishlist" });
          }
    
          userWishlist.products.push({
            productId: new mongoose.Types.ObjectId(productId),
          });
    
          await userWishlist.save();
        } else {
          const newWishlist = new wishlist({
            userId: userData._id,
            products: [{ productId }],
          });
    
          await newWishlist.save();
        }
    
        res.json({ message: "Product added to the Wishlist" });
      } catch (err) {
        console.error(err);
        return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
      }
    };
  
  
  //move to cart from wishlist
  const moveToCart= async (req, res)=>{
    try {
      // Extract user ID and product ID from the request
      const productId = req.query.productId;
      let userData = await user.findOne({ email: req.user });
      let userId = userData._id;
      // Check if the user has a cart document
      let userCart = await cart.findOne({ userId: userId });
      // If the user doesn't have a cart, create a new one
      if (!userCart) {
        userCart = new cart({
          userId: userId,
          products: [],
        });
      }
      // Check if the desired product is already in the cart
      const existingProduct = userCart.products.find(
        (product) => product.productId.toString() === productId
      );
      if (existingProduct) {
        // If the product is in the cart, increase its quantity
        existingProduct.quantity += 1;
        console.log("The product is already inside the cart.");
      } else {
        // If the product is not in the cart, add it with a quantity of 1
        userCart.products.push({
          productId: new mongoose.Types.ObjectId(productId),
          quantity: 1,
        });
      }
      // Save the updated cart document
      await userCart.save();
      await wishlist.updateOne({userId:userData._id},{$pull:{products:{productId:productId}}});
      res.redirect("/wishlist")
    } catch (err) {
      console.error("Error moving to cart:", err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });  }
  };
  
  // delete from wishlist
  const deleteFromWishlist = async (req, res) => {
    try {
      const productId = req.query.productId;
      const userData = await user.findOne({ email: req.user });
      const userId = userData._id;
  
      const updateResult = await wishlist.updateOne(
        { userId: userId },
        { $pull: { products: { productId: productId } } }
      );
  
      if (updateResult.nModified > 0) {
        console.log(`Product ${productId} removed from wishlist for user ${userId}`);
      } else {
        console.log(`Product ${productId} not found in the wishlist for user ${userId}`);
      }
  
      res.redirect("/wishlist");
    } catch (err) {
      console.log("An error happened while deleting the product from wishlist: " + err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };

module.exports = {
    getWishlist,
    addToWishlist,
    moveToCart,
    deleteFromWishlist,    
  };