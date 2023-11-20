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

//getting order details
const getOrderDetails = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const userData = await user.findOne({ email: req.user });
      const orderDetails = await order.findById({ _id: orderId }).populate({
        path: "products.productId",
        model: "product",
      });
      res.render("orderDetails", { orderDetails });
    } catch (err) {
      console.log("An error happened while loading the order details! :" + err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };

  // cash on delivery order placing
const cartOrder = async (req, res) => {
    try {
      const couponCode = req.query.couponCode;
      console.log("code=  " + couponCode);
  
      const userData = await user.findOne({ email: req.user });
      const userCart = await cart.findOne({ userId: userData._id }).populate({
        path: "products.productId",
        model: "product",
      });
  
      const userAddress = await address.findOne({ userId: userData._id });
      const selected_address = req.body.selected_address;
      const discount = req.body.discount;
      console.log("discount = " + req.body.discount);
      let orderTotal = 0;
      let orderProducts = [];
  
      userCart.products.forEach((product) => {
        const orderProduct = {
          productId: product.productId._id,
          quantity: product.quantity,
          size: product.size,
        };
        
        if (product.productId.discount && product.productId.discountStatus === "Active") {
          if (
            product.productId.offerStart &&
            product.productId.offerEnd &&
            new Date() >= new Date(product.productId.offerStart) &&
            new Date() <= new Date(product.productId.offerEnd)
          ) {
            orderProduct.price = product.productId.selling_price - product.productId.discount;
          }
        } else {
          orderProduct.price = product.productId.selling_price;
        }
        console.log(orderProduct.price);
        
        console.log("Processing product:", orderProduct);
        const userId = userData._id;
        orderTotal += orderProduct.price * orderProduct.quantity;
        orderProducts.push(orderProduct);
      });
  
      for (const prod of orderProducts) {
        let currentProduct = await product.findById(prod.productId);
      
        console.log("this product =  ", currentProduct);
      
        let sizeToUpdate = `${prod.size}`;
      
        console.log("size to update =  ", sizeToUpdate);
      
        // Access the first element of the sizes array
        let sizeObject = currentProduct.sizes[0];
      
        // Access the size property in the sizeObject
        let currentQuantity = sizeObject[sizeToUpdate];
      
        console.log("current quantity =  ", currentQuantity);
      
        if (typeof currentQuantity === 'number') {
          let updatedQuantity = currentQuantity - prod.quantity;
      
          console.log("updated quantity =  ", updatedQuantity);
  
          // Update the product sizes using $set to set the updated quantity
  // Update the product sizes using $set to set the updated quantity
  await product.updateOne(
    {
      _id: prod.productId,
      "sizes._id": sizeObject._id 
    },
    { $set: { [`sizes.$.${sizeToUpdate}`]: updatedQuantity } }
  );
  
        } else {
          console.error("Invalid current quantity:", currentQuantity);
        }
      }
  
      // Create the order with the updated total amount
      if (couponCode) {
        const couponDoc = await coupon.findOne({ code: couponCode });
        const newOrder = await order.create({
          userId: userData._id,
          products: orderProducts,
          orderDate: new Date(),
          orderAddress: userAddress.address[selected_address],
          totalAmount: orderTotal - discount,
          paymentMethod: "Cash on delivery",
          appliedCoupon: couponDoc._id,
        });
        console.log("Ordered:", newOrder);
      } else {
        const newOrder = await order.create({
          userId: userData._id,
          products: orderProducts,
          orderDate: new Date(),
          orderAddress: userAddress.address[selected_address],
          totalAmount: orderTotal - discount,
          paymentMethod: "Cash on delivery",
        });
        console.log("Ordered:", newOrder);
      }
  
      // Clear the user's cart after placing the order
      await cart.deleteOne({ userId: userData._id });
  
      res.status(200).json({ message: "Order placed successfully." });
    } catch (err) {
      console.error("An error occurred while placing the order: ", err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };

  // razorpay order placing 
const razorpayOrder = async (req, res) => {
    try {
      const couponCode=req.body.couponCode;
      console.log("code=  "+couponCode)
      const discount=req.body.discount;
      const userData = await user.findOne({ email: req.user });
      const userCart = await cart.findOne({ userId: userData._id }).populate({
        path: "products.productId",
        model: "product",
      });
      const userAddress = await address.findOne({ userId: userData._id });
      const selected_address = req.body.selected_address;
      let orderTotal = 0;
      let orderProducts = [];
  
      userCart.products.forEach((product) => {
        const orderProduct = {
          productId: product.productId._id,
          price: product.productId.selling_price,
          quantity: product.quantity,
          size: product.size,
        };
        console.log("Processing product:", orderProduct);
        const userId = userData._id;
        orderTotal += orderProduct.price * orderProduct.quantity;
        orderProducts.push(orderProduct);
      });
  
      var options = {
        amount: orderTotal * 100,  // Amount in the smallest currency unit
        currency: "INR",
        receipt: '',
      };
  
      for (const prod of orderProducts) {
        let currentProduct = await product.findById(prod.productId);
      
        console.log("this product =  ", currentProduct);
      
        let sizeToUpdate = `${prod.size}`;
      
        console.log("size to update =  ", sizeToUpdate);
      
        // Access the first element of the sizes array
        let sizeObject = currentProduct.sizes[0];
      
        // Access the size property in the sizeObject
        let currentQuantity = sizeObject[sizeToUpdate];
      
        console.log("current quantity =  ", currentQuantity);
      
        if (typeof currentQuantity === 'number') {
          let updatedQuantity = currentQuantity - prod.quantity;
      
          console.log("updated quantity =  ", updatedQuantity);
  
          // Update the product sizes using $set to set the updated quantity
  // Update the product sizes using $set to set the updated quantity
  await product.updateOne(
    {
      _id: prod.productId,
      "sizes._id": sizeObject._id // Make sure to include the _id of the sizes array element
    },
    { $set: { [`sizes.$.${sizeToUpdate}`]: updatedQuantity } }
  );
  
        } else {
          console.error("Invalid current quantity:", currentQuantity);
        }
      }
  
      // Create the Razorpay order and await its creation
      razorpay.orders.create(options, async function (err, razorOrder) {
        if (err) {
          console.error("Error creating Razorpay order:", err);
          res.status(500).json({ error: "An error occurred while placing the order." });
        } else {
          if(couponCode){
            const couponDoc= await coupon.findOne({code:couponCode});
            const newOrder = await order.create({
              userId: userData._id,
              orderId: razorOrder.id,
              products: orderProducts,
              orderDate: new Date(),
              orderAddress: userAddress.address[selected_address],
              totalAmount: orderTotal,
              paymentMethod:"Razorpay",
              appliedCoupon: couponDoc._id,
            });
            console.log("ordered "+newOrder)
          }
          else{
            const newOrder = await order.create({
              userId: userData._id,
              orderId: razorOrder.id,
              products: orderProducts,
              orderDate: new Date(),
              orderAddress: userAddress.address[selected_address],
              totalAmount: orderTotal,
              paymentMethod:"Razorpay",
            });
          }  
          console.log(razorOrder);
          await cart.deleteOne({ userId: userData._id });
          res.status(200).json({ message: "Order placed successfully.", razorOrder });
        }
      });
    } catch (err) {
      console.error("An error occurred while placing the order: ", err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });  }
  };

  //wallet Order
const walletOrder=async (req, res)=>{
    try {
      const couponCode=req.body.couponCode;
      console.log("in wallet.log")
      const userData= await user.findOne({email:req.user});
      const userCart = await cart.findOne({userId:userData._id}).populate({
        path: "products.productId",
        model: "product",
      });
      const userWallet= await wallet.findOne({userId:userData._id});
      console.log("wallet doc = "+userWallet);
      const userAddress = await address.findOne({ userId: userData._id });
      const selected_address = req.body.selected_address;
      const discount= req.body.discount;
      console.log("discount = "+req.body.discount);
      let orderTotal = 0;
      let orderProducts = [];
  
      userCart.products.forEach((product) => {
        const orderProduct = {
          productId: product.productId._id,
          price: product.productId.selling_price,
          quantity: product.quantity,
          size: product.size,
        };
        console.log("Processing product:", orderProduct);
        const userId = userData._id;
        orderTotal += orderProduct.price * orderProduct.quantity;
        orderProducts.push(orderProduct);
      });
  
  
  
      let totalAmount=orderTotal;
      console.log("total amout = "+totalAmount);
      if(discount){
        totalAmount=orderTotal-discount;
        console.log("total final = "+totalAmount);
        console.log("wallet final = "+userWallet.amount);
  
      }
      if(totalAmount>userWallet.amount){
        res.status(500).json({ error: "Insufficient balance! Please use another method." });
      }
      else{
      userWallet.amount-=totalAmount;
      await userWallet.save();
  
      for (const prod of orderProducts) {
        let currentProduct = await product.findById(prod.productId);
      
        console.log("this product =  ", currentProduct);
      
        let sizeToUpdate = `${prod.size}`;
      
        console.log("size to update =  ", sizeToUpdate);
      
        // Access the first element of the sizes array
        let sizeObject = currentProduct.sizes[0];
      
        // Access the size property in the sizeObject
        let currentQuantity = sizeObject[sizeToUpdate];
      
        console.log("current quantity =  ", currentQuantity);
      
        if (typeof currentQuantity === 'number') {
          let updatedQuantity = currentQuantity - prod.quantity;
      
          console.log("updated quantity =  ", updatedQuantity);
  
          // Update the product sizes using $set to set the updated quantity
  // Update the product sizes using $set to set the updated quantity
  await product.updateOne(
    {
      _id: prod.productId,
      "sizes._id": sizeObject._id // Make sure to include the _id of the sizes array element
    },
    { $set: { [`sizes.$.${sizeToUpdate}`]: updatedQuantity } }
  );
  
        } else {
          console.error("Invalid current quantity:", currentQuantity);
        }
      }
  
  
      if(couponCode){
        const couponDoc= await coupon.findOne({code:couponCode});
        const newOrder = await order.create({
          userId: userData._id,
          products: orderProducts,
          orderDate: new Date(),
          orderAddress: userAddress.address[selected_address],
          totalAmount: orderTotal-discount,
          paymentStatus:"Success",
          paymentMethod:"Wallet payment",
          appliedCoupon: couponDoc._id,
        });
        console.log("ordered "+newOrder)
      }
      else{
        const newOrder = await order.create({
          userId: userData._id,
          products: orderProducts,
          orderDate: new Date(),
          orderAddress: userAddress.address[selected_address],
          totalAmount: orderTotal-discount,
          paymentStatus:"Success",
          paymentMethod:"Wallet payment",
        });
      }
      await cart.deleteOne({ userId: userData._id });
      res.status(200).json({ message: "Order placed successfully." });
    }} catch (err) {
      console.error("An error occurred while placing the order: ", err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });  }
  };
  
  //update payment status
  const paymentStatus= async (req, res)=>{
    try{  
      let orderStatus= req.query.status;  
      const orderItem= await order.updateOne({orderId:req.query.orderId},{$set:{paymentStatus:orderStatus}});
      console.log("changed payment status  "+orderStatus);
      if(orderStatus=="Success"){
      res.redirect("/orderPlaced")
    }
    }
    catch(err){
      res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  }

  //get order placed
const getOrderPlaced= (req, res)=>{
    res.render("orderPlaced")
  };

  //handling returns
const productReturn = async (req, res) => {
    try {
      const userData = await user.findOne({ email: req.user });
      const orderDoc = await order.findOne({_id:req.body.orderID})
      let userReturn = await returns.findOne({ userId: userData._id });
      if (!userReturn) {
        userReturn = new returns({
          userId: userData._id,
          orders: [
            {
              orderId: req.body.orderID,
              reason: req.body.reason,
            },
          ],
        });
      } else {
        userReturn.orders.push({
          orderId: req.body.orderID,
          reason: req.body.reason,
        });
      }
      await userReturn.save();
      if(orderDoc.paymentStatus=="Success"){
      const userWallet= await wallet.findOne({userId:userData._id});
      userWallet.amount+= orderDoc.totalAmount;
      await userWallet.save()
      orderDoc.paymentStatus="Refunded";
      await orderDoc.save();
      }
      await order.updateOne(
        { _id: req.body.orderID },
        { $set: { orderStatus: "Returned" } }
        );
  
        for (const prod of orderDoc.products) {
          let currentProduct = await product.findById(prod.productId);
        
          console.log("this product =  ", currentProduct);
        
          let sizeToUpdate = `${prod.size}`;
        
          console.log("size to update =  ", sizeToUpdate);
        
          // Access the first element of the sizes array
          let sizeObject = currentProduct.sizes[0];
        
          // Access the size property in the sizeObject
          let currentQuantity = sizeObject[sizeToUpdate];
        
          console.log("current quantity =  ", currentQuantity);
        
          if (typeof currentQuantity === 'number') {
            let updatedQuantity = currentQuantity + prod.quantity;
        
            console.log("updated quantity =  ", updatedQuantity);
    
            // Update the product sizes using $set to set the updated quantity
    // Update the product sizes using $set to set the updated quantity
    await product.updateOne(
      {
        _id: prod.productId,
        "sizes._id": sizeObject._id // Make sure to include the _id of the sizes array element
      },
      { $set: { [`sizes.$.${sizeToUpdate}`]: updatedQuantity } }
    );
    
          } else {
            console.error("Invalid current quantity:", currentQuantity);
          }
        }
  
        res.redirect("/userAccount");
    } catch (err) {
      console.log("An error happened while processig return! :" + err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };

  //handling cancels
const productCancel = async (req, res) => {
    try {
      const userData = await user.findOne({ email: req.user });
      const orderDoc = await order.findOne({_id:req.body.orderID})
      let userCancel = await cancels.findOne({ userId: userData._id });
      if (!userCancel) {
        userCancel = new cancels({
          userId: userData._id,
          orders: [
            {
              orderId: req.body.orderID,
              reason: req.body.reason,
            },
          ],
        });
      } else {
        userCancel.orders.push({
          orderId: req.body.orderID,
          reason: req.body.reason,
        });
      }
      await userCancel.save();
      if(orderDoc.paymentStatus=="Success"){
        const userWallet= await wallet.findOne({userId:userData._id});
        userWallet.amount+= orderDoc.totalAmount;
        await userWallet.save()
        orderDoc.paymentStatus="Refunded";
        await orderDoc.save();
        }
  
        for (const prod of orderDoc.products) {
          let currentProduct = await product.findById(prod.productId);
        
          console.log("this product =  ", currentProduct);
        
          let sizeToUpdate = `${prod.size}`;
        
          console.log("size to update =  ", sizeToUpdate);
        
          // Access the first element of the sizes array
          let sizeObject = currentProduct.sizes[0];
        
          // Access the size property in the sizeObject
          let currentQuantity = sizeObject[sizeToUpdate];
        
          console.log("current quantity =  ", currentQuantity);
        
          if (typeof currentQuantity === 'number') {
            let updatedQuantity = currentQuantity + prod.quantity;
        
            console.log("updated quantity =  ", updatedQuantity);
    
            // Update the product sizes using $set to set the updated quantity
    // Update the product sizes using $set to set the updated quantity
    await product.updateOne(
      {
        _id: prod.productId,
        "sizes._id": sizeObject._id // Make sure to include the _id of the sizes array element
      },
      { $set: { [`sizes.$.${sizeToUpdate}`]: updatedQuantity } }
    );
    
          } else {
            console.error("Invalid current quantity:", currentQuantity);
          }
        }
  
  
      await order.updateOne(
        { _id: req.body.orderID },
        { $set: { orderStatus: "Cancelled" } }
      );
  
      res.redirect("/userAccount");
    } catch (err) {
      console.log("An error happened while processig return! :" + err);
      return res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };

module.exports = {
    cartOrder,
    razorpayOrder,
    walletOrder,
    getOrderDetails,
    productCancel,
    productReturn,
    getOrderPlaced,
    paymentStatus,
  };