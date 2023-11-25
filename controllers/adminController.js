const admin = require("../model/adminModel");
const coupon = require("../model/couponModel");
const category = require("../model/categoryModel");
const product = require("../model/productModel");
const order = require("../model/orderModel");
const user = require("../model/userModel");
const Category = require("../model/categoryModel");
const multer = require("multer");


//error page loading
const getErrorPage = (req, res) => {
  try {
    res.render("error-page");
  } catch (err) {
    console.error("An error happened while loading the error page! :" + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened while loading the error page!",
        errorMessage: err.message,
      });
  }
};

const getAdminLogin = (req, res) => {
  res.render("admin-login-page");
};

//chechking deatils and login admin
const postAdminDashboard = async (req, res) => {
  const admindata = await admin.findOne({ email: req.body.email });
  const orderDetails = await order.find().populate({
    path: "userId",
    model: user,
  });
  const totalSales= await order.aggregate([
    {
      $match: {
        paymentStatus: "Success",
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$totalAmount" },
      },
    },
  ]);
  const totalOrders= await order.find();
  const totalProducts= await product.find();
  const totalCategories= await Category.find();
  const statistics={
    totalSales,
    totalOrders:totalOrders.length,
    totalProducts:totalProducts.length,
    totalCategories:totalCategories.length,
  }
  if (!admindata) {
    res.render("admin-login-page", { error: "This email is not registered" });
  } else {
    if (admindata) {
      if (req.body.email !== admindata.email) {
        res.render("admin-login-page", { error: "Incorrect email" });
      } else if (req.body.password !== admindata.password) {
        res.render("admin-login-page", { error: "Incorrect password" });
      } else {
        if (
          req.body.email == admindata.email &&
          req.body.password == admindata.password
        ) {
          res.render("admin-dashboard", { orderDetails, statistics });
        }
      }
    } else {
      res.redirect("/admin-login-page");
    }
  }
};

//get users list
const getUsers = async (req, res) => {
  try {
    const users = await user.find();
    res.render("admin-user-management", { users });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .render("error-page", {
        message: "Error retrieving user data!",
        errorMessage: err.message,
      });
  }
};

//transactions page rendering
const getTransactions = async (req, res) => {
  try {
    const orderDetails = await order.find().populate({
      path: "userId",
      model: user,
    });
    res.render("adminTransactions", { orderDetails });
  } catch (err) {
    console.log(
      "An error happened while loading the transactions page! :" + err
    );
    res
      .status(500)
      .render("error-page", {
        message: "Error retrieving transactions!",
        errorMessage: err.message,
      });
  }
};

const postUserStatus = async (req, res) => {
  const userId = req.params.userId;
  const newStatus = req.body.status;

  try {
    const updatedUser = await user.findByIdAndUpdate(userId, {
      status: newStatus,
    });

    res.status(200).json({ status: updatedUser.status });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

module.exports = {
  getTransactions,
  postUserStatus,
  getUsers,
  postAdminDashboard,
  getAdminLogin,
  getErrorPage,
};
