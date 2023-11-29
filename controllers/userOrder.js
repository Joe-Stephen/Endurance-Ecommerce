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
const Category = require("../model/categoryModel");
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
    return res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
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
    const categoriesList = await Category.find();

    userCart.products.forEach((product) => {
      if (product.productId.status==="hide"){
        return res.status(404).json({ message: "Some products are blocked" });
      }
      const orderProduct = {
        productId: product.productId._id,
        quantity: product.quantity,
        sizes: {
          small: product.sizes.small,
          medium: product.sizes.medium,
          large: product.sizes.large,
        },
      };

      // Initialize variables to store product and category discounts
      let productDiscount = 0;
      let categoryDiscount = 0;

      // Check if the product has an active offer
      if (
        product.productId.discount &&
        product.productId.discountStatus === "Active"
      ) {
        if (
          product.productId.offerStart &&
          product.productId.offerEnd &&
          new Date() >= new Date(product.productId.offerStart) &&
          new Date() <= new Date(product.productId.offerEnd)
        ) {
          if (product.productId.discountType === "percentage") {
            productDiscount = calculateDiscount(
              product.productId.discountType,
              product.productId.discountValue,
              product.productId.selling_price
            );
            console.log("product discount percentage== " + productDiscount);
          } else {
            productDiscount = product.productId.discount;
            console.log("product discount fixed== " + productDiscount);
          }
        }
      }

      const productCategory = product.productId.category;

      // Find the corresponding category in the categoriesList
      const category = categoriesList.find(
        (category) => category.name === productCategory
      );

      console.log("this is the category       ==== " + category);

      // Check if the category has an active offer
      if (category.discount && category.discountStatus === "Active") {
        if (
          category.offerStart &&
          category.offerEnd &&
          new Date() >= new Date(category.offerStart) &&
          new Date() <= new Date(category.offerEnd)
        ) {
          if (category.discountType === "percentage") {
            console.log("cat disc type    ==" + category.discountType);
            categoryDiscount = calculateDiscount(
              category.discountType,
              category.discount,
              product.productId.selling_price
            );
            let temp = categoryDiscount;
            categoryDiscount =
              temp > category.maxRedeemableAmt
                ? category.maxRedeemableAmt
                : temp;
            console.log("category discount percentage== " + categoryDiscount);
          } else {
            categoryDiscount = category.discount;
            console.log("category discount percentage== " + category.discount);
          }
        }
      }

      // Choose the higher discount between product and category
      const higherDiscount = Math.max(productDiscount, categoryDiscount);

      // Calculate the order product price with the chosen discount
      if (higherDiscount > 0) {
        orderProduct.price = product.productId.selling_price - higherDiscount;
      } else {
        orderProduct.price = product.productId.selling_price;
      }

      console.log(orderProduct.price);

      console.log("Processing product:", orderProduct);
      const userId = userData._id;
      orderTotal += orderProduct.price * orderProduct.quantity;
      orderProducts.push(orderProduct);
    });

    let insufficientProducts = [];

    for (const prod of orderProducts) {
      try {
        let currentProduct = await product.findById(prod.productId);

        console.log("this product = ", currentProduct);



        let sizeSmall = prod.sizes.small;
        console.log(
          "current small = " +
            currentProduct.sizes.small +
            " new small = " +
            sizeSmall
        );

        let sizeMedium = prod.sizes.medium;
        console.log(
          "current medium = " +
            currentProduct.sizes.medium +
            " new medium = " +
            sizeMedium
        );

        let sizeLarge = prod.sizes.large;
        console.log(
          "current large = " +
            currentProduct.sizes.large +
            " new large = " +
            sizeLarge
        );

        let shortSizes = [];
        

        if (currentProduct.sizes.small < sizeSmall) {
          console.log(
            "current small = " +
              currentProduct.sizes.small +
              " new small = " +
              sizeSmall
          );
          shortSizes.push({ small: sizeSmall });
        }
        if (currentProduct.sizes.medium < sizeMedium) {
          console.log(
            "current small = " +
              currentProduct.sizes.medium +
              " new small = " +
              sizeMedium
          );
          shortSizes.push({ medium: sizeMedium });
        }
        if (currentProduct.sizes.large < sizeLarge) {
          console.log(
            "current small = " +
              currentProduct.sizes.large +
              " new small = " +
              sizeLarge
          );
          shortSizes.push({ large: sizeLarge });
        }
        if (shortSizes.length !== 0) {
          console.log("Insufficient quantity for the order");
          insufficientProducts.push(prod.name);
        }
      } catch (err) {
        console.error("Error updating product sizes:", err);
        return res.status(500).render("error-page", {
          message: "An error happened !",
          errorMessage: err.message,
        });
      }
    }


    if (insufficientProducts.length > 0) {
      return res.status(404).json({ message: "Insufficient stock" });
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

    //updating stock
    for (const prod of orderProducts) {
      try {
        await product.findByIdAndUpdate(prod.productId, {
          $inc: {
            "sizes.small": -prod.sizes.small,
            "sizes.medium": -prod.sizes.medium,
            "sizes.large": -prod.sizes.large,
          },
        });
      } catch (err) {
        console.error("Error updating product stock:", err);
        return res.status(500).json({
          message: "Failed to update product stock. Please try again later.",
        });
      }
    }
    // Clear the user's cart after placing the order
    await cart.deleteOne({ userId: userData._id });

    res.status(200).json({ message: "Order placed successfully." });
  } catch (err) {
    console.error("An error occurred while placing the order: ", err);
    return res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

//function for calculating the discount value in percentage
const calculateDiscount = (discountType, discountValue, grandTotal) => {
  switch (discountType) {
    case "fixedAmount":
      return discountValue;
    case "percentage":
      return (discountValue / 100) * grandTotal;
    default:
      return 0;
  }
};

// razorpay order placing
const razorpayOrder = async (req, res) => {
  try {
    const categoriesList = await Category.find();
    const couponCode = req.body.couponCode;
    console.log("code=  " + couponCode);
    const discount = req.body.discount;
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
      if (product.productId.status==="hide"){
        return res.status(404).json({ message: "Some products are blocked" });
      }
      const orderProduct = {
        productId: product.productId._id,
        quantity: product.quantity,
        sizes: {
          small: product.sizes.small,
          medium: product.sizes.medium,
          large: product.sizes.large,
        },
      };
      // Initialize variables to store product and category discounts
      let productDiscount = 0;
      let categoryDiscount = 0;

      // Check if the product has an active offer
      if (
        product.productId.discount &&
        product.productId.discountStatus === "Active"
      ) {
        if (
          product.productId.offerStart &&
          product.productId.offerEnd &&
          new Date() >= new Date(product.productId.offerStart) &&
          new Date() <= new Date(product.productId.offerEnd)
        ) {
          if (product.productId.discountType === "percentage") {
            productDiscount = calculateDiscount(
              product.productId.discountType,
              product.productId.discountValue,
              product.productId.selling_price
            );
            console.log("product discount percentage== " + productDiscount);
          } else {
            productDiscount = product.productId.discount;
            console.log("product discount fixed== " + productDiscount);
          }
        }
      }

      const productCategory = product.productId.category;

      // Find the corresponding category in the categoriesList
      const category = categoriesList.find(
        (category) => category.name === productCategory
      );

      console.log("this is the category       ==== " + category);

      // Check if the category has an active offer
      if (category.discount && category.discountStatus === "Active") {
        if (
          category.offerStart &&
          category.offerEnd &&
          new Date() >= new Date(category.offerStart) &&
          new Date() <= new Date(category.offerEnd)
        ) {
          if (category.discountType === "percentage") {
            console.log("cat disc type    ==" + category.discountType);
            categoryDiscount = calculateDiscount(
              category.discountType,
              category.discount,
              product.productId.selling_price
            );
            let temp = categoryDiscount;
            categoryDiscount =
              temp > category.maxRedeemableAmt
                ? category.maxRedeemableAmt
                : temp;
            console.log("category discount percentage== " + categoryDiscount);
          } else {
            categoryDiscount = category.discount;
            console.log("category discount percentage== " + category.discount);
          }
        }
      }

      // Choose the higher discount between product and category
      const higherDiscount = Math.max(productDiscount, categoryDiscount);

      // Calculate the order product price with the chosen discount
      if (higherDiscount > 0) {
        orderProduct.price = product.productId.selling_price - higherDiscount;
      } else {
        orderProduct.price = product.productId.selling_price;
      }

      console.log(orderProduct.price);

      console.log("Processing product:", orderProduct);
      const userId = userData._id;
      orderTotal += orderProduct.price * orderProduct.quantity;
      orderProducts.push(orderProduct);
    });

    var options = {
      amount: orderTotal * 100, // Amount in the smallest currency unit
      currency: "INR",
      receipt: "",
    };
    let insufficientProducts = [];

    for (const prod of orderProducts) {
      try {
        let currentProduct = await product.findById(prod.productId);

        console.log("this product = ", currentProduct);

        let sizeSmall = prod.sizes.small;
        console.log(
          "current small = " +
            currentProduct.sizes.small +
            " new small = " +
            sizeSmall
        );

        let sizeMedium = prod.sizes.medium;
        console.log(
          "current medium = " +
            currentProduct.sizes.medium +
            " new medium = " +
            sizeMedium
        );

        let sizeLarge = prod.sizes.large;
        console.log(
          "current large = " +
            currentProduct.sizes.large +
            " new large = " +
            sizeLarge
        );

        let shortSizes = [];
        if (currentProduct.sizes.small < sizeSmall) {
          console.log(
            "current small = " +
              currentProduct.sizes.small +
              " new small = " +
              sizeSmall
          );
          shortSizes.push({ small: sizeSmall });
        }
        if (currentProduct.sizes.medium < sizeMedium) {
          console.log(
            "current small = " +
              currentProduct.sizes.medium +
              " new small = " +
              sizeMedium
          );
          shortSizes.push({ medium: sizeMedium });
        }
        if (currentProduct.sizes.large < sizeLarge) {
          console.log(
            "current small = " +
              currentProduct.sizes.large +
              " new small = " +
              sizeLarge
          );
          shortSizes.push({ large: sizeLarge });
        }
        if (shortSizes.length !== 0) {
          console.log("Insufficient quantity for the order");
          insufficientProducts.push(prod.name);
        }
      } catch (err) {
        console.error("Error updating product sizes:", err);
        return res.status(500).render("error-page", {
          message: "An error happened !",
          errorMessage: err.message,
        });
      }
    }

    if (insufficientProducts.length > 0) {
      return res.status(404).json({ message: "Insufficient stock" });
    }

    // Create the Razorpay order and await its creation
    razorpay.orders.create(options, async function (err, razorOrder) {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        res
          .status(500)
          .json({ error: "An error occurred while placing the order." });
      } else {
        if (couponCode) {
          const couponDoc = await coupon.findOne({ code: couponCode });
          const newOrder = await order.create({
            userId: userData._id,
            orderId: razorOrder.id,
            products: orderProducts,
            orderDate: new Date(),
            orderAddress: userAddress.address[selected_address],
            totalAmount: orderTotal,
            paymentMethod: "Razorpay",
            appliedCoupon: couponDoc._id,
          });
          console.log("ordered " + newOrder);
        } else {
          const newOrder = await order.create({
            userId: userData._id,
            orderId: razorOrder.id,
            products: orderProducts,
            orderDate: new Date(),
            orderAddress: userAddress.address[selected_address],
            totalAmount: orderTotal,
            paymentMethod: "Razorpay",
          });
        }
        console.log(razorOrder);
        for (const prod of orderProducts) {
          try {
            await product.findByIdAndUpdate(prod.productId, {
              $inc: {
                "sizes.small": -prod.sizes.small,
                "sizes.medium": -prod.sizes.medium,
                "sizes.large": -prod.sizes.large,
              },
            });
          } catch (err) {
            console.error("Error updating product stock:", err);
            return res.status(500).json({
              message:
                "Failed to update product stock. Please try again later.",
            });
          }
        }
        await cart.deleteOne({ userId: userData._id });
        res
          .status(200)
          .json({ message: "Order placed successfully.", razorOrder });
      }
    });
  } catch (err) {
    console.error("An error occurred while placing the order: ", err);
    return res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

// wallet Order
const walletOrder = async (req, res) => {
  try {
    const categoriesList = await Category.find();
    const couponCode = req.body.couponCode;
    console.log("in wallet.log");
    const userData = await user.findOne({ email: req.user });
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId",
      model: "product",
    });
    const userWallet = await wallet.findOne({ userId: userData._id });
    console.log("wallet doc = " + userWallet);
    const userAddress = await address.findOne({ userId: userData._id });
    const selected_address = req.body.selected_address;
    const discount = req.body.discount;
    console.log("discount = " + req.body.discount);
    let orderTotal = 0;
    let orderProducts = [];

    userCart.products.forEach((product) => {
      if (product.productId.status==="hide"){
        return res.status(404).json({ message: "Some products are blocked" });
      }
      const orderProduct = {
        productId: product.productId._id,
        quantity: product.quantity,
        sizes: {
          small: product.sizes.small,
          medium: product.sizes.medium,
          large: product.sizes.large,
        },
      };

      // Initialize variables to store product and category discounts
      let productDiscount = 0;
      let categoryDiscount = 0;

      // Check if the product has an active offer
      if (
        product.productId.discount &&
        product.productId.discountStatus === "Active"
      ) {
        if (
          product.productId.offerStart &&
          product.productId.offerEnd &&
          new Date() >= new Date(product.productId.offerStart) &&
          new Date() <= new Date(product.productId.offerEnd)
        ) {
          if (product.productId.discountType === "percentage") {
            productDiscount = calculateDiscount(
              product.productId.discountType,
              product.productId.discountValue,
              product.productId.selling_price
            );
            console.log("product discount percentage== " + productDiscount);
          } else {
            productDiscount = product.productId.discount;
            console.log("product discount fixed== " + productDiscount);
          }
        }
      }

      const productCategory = product.productId.category;

      // Find the corresponding category in the categoriesList
      const category = categoriesList.find(
        (category) => category.name === productCategory
      );

      console.log("this is the category       ==== " + category);

      // Check if the category has an active offer
      if (category.discount && category.discountStatus === "Active") {
        if (
          category.offerStart &&
          category.offerEnd &&
          new Date() >= new Date(category.offerStart) &&
          new Date() <= new Date(category.offerEnd)
        ) {
          if (category.discountType === "percentage") {
            console.log("cat disc type    ==" + category.discountType);
            categoryDiscount = calculateDiscount(
              category.discountType,
              category.discount,
              product.productId.selling_price
            );
            let temp = categoryDiscount;
            categoryDiscount =
              temp > category.maxRedeemableAmt
                ? category.maxRedeemableAmt
                : temp;
            console.log("category discount percentage== " + categoryDiscount);
          } else {
            categoryDiscount = category.discount;
            console.log("category discount percentage== " + category.discount);
          }
        }
      }

      // Choose the higher discount between product and category
      const higherDiscount = Math.max(productDiscount, categoryDiscount);

      // Calculate the order product price with the chosen discount
      if (higherDiscount > 0) {
        orderProduct.price = product.productId.selling_price - higherDiscount;
      } else {
        orderProduct.price = product.productId.selling_price;
      }

      console.log(orderProduct.price);

      console.log("Processing product:", orderProduct);
      const userId = userData._id;
      orderTotal += orderProduct.price * orderProduct.quantity;
      orderProducts.push(orderProduct);
    });

    let totalAmount = orderTotal;
    console.log("total amout = " + totalAmount);
    if (discount) {
      totalAmount = orderTotal - discount;
      console.log("total final = " + totalAmount);
      console.log("wallet final = " + userWallet.amount);
    }
    if (totalAmount > userWallet.amount) {
      res.status(404).json({ message: "Insufficient balance" });
    } else {
      userWallet.amount -= totalAmount;
      await userWallet.save();

      let insufficientProducts = [];

      for (const prod of orderProducts) {
        try {
          let currentProduct = await product.findById(prod.productId);

          console.log("this product = ", currentProduct);

          let sizeSmall = prod.sizes.small;
          console.log(
            "current small = " +
              currentProduct.sizes.small +
              " new small = " +
              sizeSmall
          );

          let sizeMedium = prod.sizes.medium;
          console.log(
            "current medium = " +
              currentProduct.sizes.medium +
              " new medium = " +
              sizeMedium
          );

          let sizeLarge = prod.sizes.large;
          console.log(
            "current large = " +
              currentProduct.sizes.large +
              " new large = " +
              sizeLarge
          );

          let shortSizes = [];
          if (currentProduct.sizes.small < sizeSmall) {
            console.log(
              "current small = " +
                currentProduct.sizes.small +
                " new small = " +
                sizeSmall
            );
            shortSizes.push({ small: sizeSmall });
          }
          if (currentProduct.sizes.medium < sizeMedium) {
            console.log(
              "current small = " +
                currentProduct.sizes.medium +
                " new small = " +
                sizeMedium
            );
            shortSizes.push({ medium: sizeMedium });
          }
          if (currentProduct.sizes.large < sizeLarge) {
            console.log(
              "current small = " +
                currentProduct.sizes.large +
                " new small = " +
                sizeLarge
            );
            shortSizes.push({ large: sizeLarge });
          }
          if (shortSizes.length !== 0) {
            console.log("Insufficient quantity for the order");
            insufficientProducts.push(prod.name);
          }
        } catch (err) {
          console.error("Error updating product sizes:", err);
          return res.status(500).render("error-page", {
            message: "An error happened !",
            errorMessage: err.message,
          });
        }
      }

      if (insufficientProducts.length > 0) {
        return res.status(404).json({ message: "Insufficient stock" });
      }

      if (couponCode) {
        const couponDoc = await coupon.findOne({ code: couponCode });
        const newOrder = await order.create({
          userId: userData._id,
          products: orderProducts,
          orderDate: new Date(),
          orderAddress: userAddress.address[selected_address],
          totalAmount: orderTotal - discount,
          paymentStatus: "Success",
          paymentMethod: "Wallet payment",
          appliedCoupon: couponDoc._id,
        });
        console.log("ordered " + newOrder);
      } else {
        const newOrder = await order.create({
          userId: userData._id,
          products: orderProducts,
          orderDate: new Date(),
          orderAddress: userAddress.address[selected_address],
          totalAmount: orderTotal - discount,
          paymentStatus: "Success",
          paymentMethod: "Wallet payment",
        });
      }
      //updating stock
      for (const prod of orderProducts) {
        try {
          await product.findByIdAndUpdate(prod.productId, {
            $inc: {
              "sizes.small": -prod.sizes.small,
              "sizes.medium": -prod.sizes.medium,
              "sizes.large": -prod.sizes.large,
            },
          });
        } catch (err) {
          console.error("Error updating product stock:", err);
          return res.status(500).json({
            message: "Failed to update product stock. Please try again later.",
          });
        }
      }
      await cart.deleteOne({ userId: userData._id });
      res.status(200).json({ message: "Order placed successfully." });
    }
  } catch (err) {
    console.error("An error occurred while placing the order: ", err);
    return res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

//update payment status
const paymentStatus = async (req, res) => {
  try {
    let orderStatus = req.query.status;
    const orderItem = await order.updateOne(
      { orderId: req.query.orderId },
      { $set: { paymentStatus: orderStatus } }
    );
    console.log("changed payment status  " + orderStatus);
    if (orderStatus == "Success") {
      res.redirect("/orderPlaced");
    }
  } catch (err) {
    res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

//get order placed
const getOrderPlaced = (req, res) => {
  res.render("orderPlaced");
};

//handling returns
const productReturn = async (req, res) => {
  try {
    const userData = await user.findOne({ email: req.user });
    const orderDoc = await order.findOne({ _id: req.body.orderID });
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
    if (orderDoc.paymentStatus == "Success") {
      const userWallet = await wallet.findOne({ userId: userData._id });
      userWallet.amount += orderDoc.totalAmount;
      await userWallet.save();
      orderDoc.paymentStatus = "Refunded";
      await orderDoc.save();
    }
    await order.updateOne(
      { _id: req.body.orderID },
      { $set: { orderStatus: "Returned" } }
    );

    //updating stock
    for (const prod of orderDoc.products) {
      try {
        await product.findByIdAndUpdate(prod.productId, {
          $inc: {
            "sizes.small": prod.sizes.small,
            "sizes.medium": prod.sizes.medium,
            "sizes.large": prod.sizes.large,
          },
        });
      } catch (err) {
        console.error("Error updating product stock:", err);
        return res.status(500).json({
          message: "Failed to update product stock. Please try again later.",
        });
      }
    }

    res.redirect("/userAccount");
  } catch (err) {
    console.log("An error happened while processig return! :" + err);
    return res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

//handling cancels
const productCancel = async (req, res) => {
  try {
    const userData = await user.findOne({ email: req.user });
    const orderDoc = await order.findOne({ _id: req.body.orderID });
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
    if (orderDoc.paymentStatus == "Success") {
      const userWallet = await wallet.findOne({ userId: userData._id });
      userWallet.amount += orderDoc.totalAmount;
      await userWallet.save();
      orderDoc.paymentStatus = "Refunded";
      await orderDoc.save();
    }
    //updating stock
    for (const prod of orderDoc.products) {
      try {
        await product.findByIdAndUpdate(prod.productId, {
          $inc: {
            "sizes.small": prod.sizes.small,
            "sizes.medium": prod.sizes.medium,
            "sizes.large": prod.sizes.large,
          },
        });
      } catch (err) {
        console.error("Error updating product stock:", err);
        return res.status(500).json({
          message: "Failed to update product stock. Please try again later.",
        });
      }
    }
    await order.updateOne(
      { _id: req.body.orderID },
      { $set: { orderStatus: "Cancelled" } }
    );

    res.redirect("/userAccount");
  } catch (err) {
    console.log("An error happened while processig return! :" + err);
    return res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

//loading invoice page
const getInvoicePage = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const orderDocument = await order.findById(orderId).populate({
      path: "products.productId",
      model: "product",
    });
    res.render("invoiceDownloadPage", { orderDocument });
  } catch (err) {
    console.log("An error happened while processig return! :" + err);
    return res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
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
  getInvoicePage,
};
