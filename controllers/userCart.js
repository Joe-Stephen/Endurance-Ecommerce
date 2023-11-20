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


//getting cart
const getCart = async (req, res) => {
    try {
      const loggedIn = req.user ? true : false;
      const userData = await user.findOne({ email: req.user });
      const userCart = await cart.findOne({ userId: userData._id }).populate({
        path: "products.productId",
        model: "product",
      });
      console.log(userCart);
      // The 'userCart' now contains the populated 'products' array with product details
      // You can access these details in your template
      res.render("cart", { userCart, loggedIn });
    } catch (err) {
      console.error("Error while loading cart:", err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
      // Handle the error as needed
    }
  };
  
    //function for adding product to cart
    const addToCartController = async (req, res) => {
      try {
        const selectedSize= req.query.selectedSize ;
        console.log("selected size is = "+selectedSize);
        // Extract user ID and product ID from the request
        const { productId } = req.body;
        const sizeCheck= await product.findById(productId);
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
            size:selectedSize,
            quantity: 1,
          });
        }
        // Save the updated cart document
        await userCart.save();
      } catch (err) {
        console.error("Error adding to cart:", err);
        return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });    }
    };
  
  //updating cart quantity
  const postCartQty = async (req, res) => {
    try {
      const userData = await user.findOne({ email: req.user });
      const userCart = await cart.findOne({ userId: userData._id }).populate({
        path: "products.productId",
        model: "product",
      });
      if (!userCart) {
        return res.status(404).json({ error: "User cart not found" });
      }
      const productId = req.body.productId;
      const action = req.body.action;
      const productInCart = userCart.products.find(
        (product) => product._id.toString() === productId
      );
  
      if (!productInCart) {
        return res.status(404).json({ error: "Product not found in the cart" });
      }
  
      if (action === "increase") {
        productInCart.quantity += 1;
      } else if (action === "decrease") {
        if (productInCart.quantity > 1) {
          productInCart.quantity -= 1;
        }
      } else {
        return res.status(400).json({ error: "Invalid action provided" });
      }
  
      await userCart.save();
  
      // Calculate the updatedSubtotal as a number
      let updatedSubtotal=0;
      if(productInCart.productId.discount&&productInCart.productId.discountStatus==="Active"){
        updatedSubtotal=Number((productInCart.productId.selling_price)-productInCart.productId.discount) * productInCart.quantity;
            }else{
              updatedSubtotal=Number(productInCart.productId.selling_price) * productInCart.quantity;
      }
  
      // Create a response object with the updated quantity and subtotal
      const response = {
        updatedQuantity: productInCart.quantity,
        updatedSubtotal,
      };
  
      return res.json(response);
    } catch (err) {
      console.log("An error occurred while modifying quantity: " + err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };
  
  // Controller function to remove a product from the cart
  const removeProductFromCart = async (req, res) => {
    try {
      const userData = await user.findOne({ email: req.user });
      const userCart = await cart.findOne({ userId: userData._id });
      // Extract the product ID from the request parameters
      const productId = req.params.productId;
      if (!userCart) {
        return res.status(404).json({ error: "User cart not found" });
      }
      // Find the product in the user's cart by its ID
      const productIndex = userCart.products.findIndex(
        (product) => product._id.toString() === productId
      );
      if (productIndex === -1) {
        return res.status(404).json({ error: "Product not found in the cart" });
      }
      // Remove the product from the user's cart
      userCart.products.splice(productIndex, 1);
      // Save the updated cart
      await userCart.save();
      res.sendStatus(200); // Send a success status code
    } catch (err) {
      console.error("Error removing the product from the cart: " + err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });  }
  };
  
  //checkout from cart
  const getCartCheckout = async (req, res) => {
    try {
      const coupons = await coupon.find();
      const loggedIn = req.user ? true : false;
      const userData = await user.findOne({ email: req.user });
      const userCart = await cart.findOne({ userId: userData._id }).populate({
        path: "products.productId",
        model: "product",
      });
  
      let orderTotal = 0;
      let orderProducts = [];
      let insufficientProducts = []; // Keep track of products with insufficient quantity
  
      userCart.products.forEach((product) => {
        const orderProduct = {
          productId: product.productId._id,
          name: product.productId.name, // Include the name of the product
          price: product.productId.selling_price,
          quantity: product.quantity,
          size: product.size,
        };
        console.log("Processing product:", orderProduct);
        const userId = userData._id;
        orderTotal += orderProduct.price * orderProduct.quantity;
        orderProducts.push(orderProduct);
      });
  
      for (const prod of orderProducts) {
        try {
          let currentProduct = await product.findById(prod.productId);
  
          console.log("this product =  ", currentProduct);
  
          let sizeToUpdate = `${prod.size}`;
  
          console.log("size to update =  ", sizeToUpdate);
  
          // Access the first element of the sizes array
          let sizeObject = currentProduct.sizes[0];
  
          // Access the size property in the sizeObject
          let currentQuantity = sizeObject[sizeToUpdate];
  
          console.log("current quantity =  ", currentQuantity);
  
          if (typeof currentQuantity === 'number' && currentQuantity >= prod.quantity) {
            let updatedQuantity = currentQuantity - prod.quantity;
  
            console.log("updated quantity =  ", updatedQuantity);
  
            // Update the product sizes using $set to set the updated quantity
            await product.updateOne(
              { _id: currentProduct._id, 'sizes._id': sizeObject._id },
              { $set: { 'sizes.$.quantity': updatedQuantity } }
            );
            console.log("Product sizes updated successfully");
          } else {
            console.log("Insufficient quantity for the order");
            insufficientProducts.push(prod.name); // Add the name of the insufficient product
          }
        } catch (err) {
          console.error("Error updating product sizes:", err);
          return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  
          // Handle the error
        }
      }
  
      const userAddress = await address.findOne({ userId: userData._id });
      if (!userAddress) {
        res.redirect("/addAddress");
      } else {
        if (insufficientProducts.length > 0) {
          // Render the cart with an error message including insufficient product names
          res.render("cart", { userCart, loggedIn, subreddit: "Insufficient stock for products: " + insufficientProducts.join(", ") });
        } else {
          // Render the checkout page
          res.render("checkout", { userCart, loggedIn, userAddress, coupons });
        }
      }
    } catch (err) {
      console.log("An error happened while loading checkout page." + err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };

module.exports = {
    getCart,
    addToCartController,
    postCartQty,
    removeProductFromCart,
    getCartCheckout,
  };