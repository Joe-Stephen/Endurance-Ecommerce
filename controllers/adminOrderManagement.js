const admin = require("../model/adminModel");
const coupon = require("../model/couponModel");
const category = require("../model/categoryModel");
const product = require("../model/productModel");
const order = require("../model/orderModel");
const user = require("../model/userModel");
const multer = require("multer");

//getting order list
const getOrderList = async (req, res) => {
  try {
    const orderList = await order.find().sort({ orderDate: -1 });
    // console.log("An error happened while loading order list!: "+orderList );
    let userData = [];

    // Loop through each order in orderList
    for (const orderItem of orderList) {
      const userId = orderItem.userId;
      console.log("uswer id: " + userId);

      let userDoc = await user.findById({ _id: userId });
      console.log("uswer doc: " + userDoc);
      userData.push(userDoc.username);
    }
    console.log("user data: " + userData);

    res.render("admin-order-management", { orderList, userData });
  } catch (error) {
    console.log("An error happened while loading order list!:" + error);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//getting order details and edit
const getOrderDetails = async (req, res) => {
  try {
    const orderDetails = await order
      .findById({ _id: req.params.orderId })
      .populate({
        path: "products.productId",
        model: "product",
      });
    const userId = orderDetails.userId;
    const userData = await user.findById(userId);
    res.render("admin-order-edit", { orderDetails, userData });
  } catch (err) {
    console.log("An error happened while accessing order details! :" + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//editing order status
const editOrderStatus = async (req, res) => {
  try {
    await order.updateOne(
      { _id: req.body.orderId },
      { $set: { orderStatus: req.body.orderStatus } }
    );
    res.redirect("/admin/orderList");
  } catch (err) {
    console.log("An error happened while editing the order status! :" + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

module.exports = {
  getOrderList,
  getOrderDetails,
  editOrderStatus,
};
