const admin = require("../model/adminModel");
const coupon = require("../model/couponModel");
const category = require("../model/categoryModel");
const product = require("../model/productModel");
const order = require("../model/orderModel");
const cancels = require("../model/cancelModel");
const returns = require("../model/returnModel");

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
  const cancelData = await cancels.aggregate([
    {
      $group: {
        _id: { $month: '$cancelDate' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        count: { $ifNull: ['$count', 0] },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);
  const returnData = await returns.aggregate([
    {
      $group: {
        _id: { $month: '$returnDate' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        count: { $ifNull: ['$count', 0] },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);
  const orderData = await order.aggregate([
    {
      $group: {
        _id: { $month: '$orderDate' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        count: { $ifNull: ['$count', 0] },
      },
    },
  ]);
  
  // Assuming you already have orderData, fill in zeroes for missing months for cancels and returns
  const filledOrderData =  fillDataWithZeroes(orderData);
  const filledCancelData = fillDataWithZeroes(cancelData);
  const filledReturnData = fillDataWithZeroes(returnData);
  
  // Combine all the data to be sent to the client
  
  function fillDataWithZeroes(data) {
    const labels = Array.from({ length: 12 }, (_, index) => index + 1);
    return labels.map((month) => {
      const existingMonth = data.find((item) => item._id === month);
      return { _id: month, count: existingMonth ? existingMonth.count : 0 };
    });
  }
  
  // Starting month is November (index 10 in JavaScript Date object)
  const startingMonth = 10;
  
  // Create an array of labels covering the entire range
  const labels = Array.from({ length: 12 }, (_, index) => (index + startingMonth) % 12 + 1);

  const chartFeeder = {
    orderData: filledOrderData,
    cancelData: filledCancelData,
    returnData: filledReturnData,
  };
  



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
          console.log('Order Data:', orderData);
          console.log('cancel Data:', cancelData);
          console.log('return Data:', returnData);
          res.render("admin-dashboard", { orderDetails, statistics, chartFeeder: JSON.stringify(chartFeeder) });
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

//rendering sales report - daily
const getDailySalesReport = async (req, res)=>{
  try{
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1); // Get the next day

    const dailySales = await order.find({
      orderDate: { $gte: currentDate, $lt: nextDate },
    })
    .populate('userId')
    .populate('products.productId');

    // Calculate total orders and total sales
    const totalOrders = dailySales.length;
    const totalSales = dailySales.reduce((total, order) => total + order.totalAmount, 0);

    // Format date as required
    const formattedDate = currentDate.toDateString();+

    console.log("totalSales  =="+totalSales)

    res.render('adminDailySalesReport', { dailySales, formattedDate, totalOrders, totalSales });

   } catch (err) {
    console.error(err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
}

//rendering sales report - weekly
const getWeeklySalesReport = async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Get the date from one week ago

    // Find orders within the past week
    const weeklySales = await order
      .find({
        orderDate: { $gte: oneWeekAgo, $lt: currentDate },
      })
      .populate('userId')
      .populate('products.productId');

    // Calculate total orders and total sales for the week
    const totalOrders = weeklySales.length;
    const totalSales = weeklySales.reduce((total, order) => total + order.totalAmount, 0);

    // Format date range as required
    const formattedDateRange = `${oneWeekAgo.toDateString()} to ${currentDate.toDateString()}`;

    console.log("totalSales for the past week =", totalSales);

    res.render('adminWeeklySalesReport', { weeklySales, formattedDateRange, totalOrders, totalSales });

  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render('error-page', {
        message: 'An error happened!',
        errorMessage: err.message,
      });
  }
};

//rendering sales report - weekly
const getMonthlySalesReport = async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30); // Get the date from one week ago

    // Find orders within the past week
    const monthlySales = await order
      .find({
        orderDate: { $gte: oneMonthAgo, $lt: currentDate },
      })
      .populate('userId')
      .populate('products.productId');

    // Calculate total orders and total sales for the week
    const totalOrders = monthlySales.length;
    const totalSales = monthlySales.reduce((total, order) => total + order.totalAmount, 0);

    // Format date range as required
    const formattedDateRange = `${oneMonthAgo.toDateString()} to ${currentDate.toDateString()}`;

    console.log("totalSales for the past month =", totalSales);

    res.render('adminMonthlySalesReport', { monthlySales, formattedDateRange, totalOrders, totalSales });

  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render('error-page', {
        message: 'An error happened!',
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
  getDailySalesReport,
  getWeeklySalesReport,
  getMonthlySalesReport,
};
