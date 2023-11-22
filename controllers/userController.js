require("dotenv").config();
const user = require("../model/userModel");
const { v4: uuidv4 } = require('uuid');
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

const getHomePage = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const banners = await banner.find();

    const page = parseInt(req.query.page) || 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 9;

    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);

    const skip = (page - 1) * no_of_docs_each_page;

    const products = await product
      .find({ status: { $ne: "hide" } })
      .skip(skip)
      .limit(no_of_docs_each_page);

    res.render("index-4", { products, loggedIn, page, totalPages, banners }); // Pass the 'totalPages' variable to the template
  } catch (err) {
    console.error(err);
    res.render("error-page");
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//search results in the home page
const searchResults = async (req, res) => {
  try {
    const page = req.query.page ?? 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    console.log(page);
    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);

    const skip = (page - 1) * no_of_docs_each_page;

    const loggedIn = req.cookies.loggedIn;
    const searchQuery = req.query.searchHomeValue;
    const regex = new RegExp(searchQuery, "i");
    const products = await product.find({ name: regex });
    let result = "";
    if (products.length === 0) {
      result = "No products found...";
    } else {
      result = "We found these...";
    }
    res.render("index-4", { result, products, loggedIn, totalPages, page });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//getting user account
const getUserAccount = async (req, res) => {
  try {
    const loggedIn = req.user ? true : false;
    const userData = await user.findOne({ email: req.user });
    const userAddress = await address.findOne({ userId: userData._id });
    const userWallet = await wallet.findOne({ userId: userData._id });
    const orders = await order
      .find({ userId: userData._id })
      .sort({ orderDate: -1 })
      .populate({
        path: "products.productId",
        model: "product",
      });

    res.render("userDashboard", {
      userData,
      userAddress,
      orders,
      loggedIn,
      userWallet,
    });
  } catch (err) {
    console.log("An error happened in fetching user dashboard " + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//getting user logout
const logout = (req, res) => {
  // console.log(req.user)
  // console.log(req.cookies.token)
  res.clearCookie("token");
  res.clearCookie("loggedIn");
  res.redirect("/getLogin");
};

//code for email sending and verification

// const sendVerifyMail = async (name, email, user_id) => {
//   try {
//     console.log(
//       "The verification mail has been send, please check your inbox for the same."
//     );
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       requireTLS: true,
//       auth: {
//         user: "joestephenk10@gmail.com",
//         pass: "pqch fcmn ruxe hhyt",
//       },
//     });
//     const mailOptions = {
//       from: "joestephenk10@gmail.com",
//       to: email,
//       subject: "Account verification mail",
//       html:
//         "<p>Hello " +
//         name +
//         ', please click here to <a href="http://127.0.0.1:3000/verify-email?id=' +
//         user_id +
//         '"> Verify </a> your mail.</p>',
//     };
//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log("Email has been sent: ", info.response);
//       }
//       console.log("hia");
//     });
//   } catch (err) {
//     console.log(err.message);
// res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
//   }
// };

// const verifyEmail = async (req, res) => {
//   try {
//     const updateInfo = await user.updateOne(
//       { _id: req.query.id },
//       { $set: { isVerified: 1 } }
//     );
//     console.log(updateInfo);
//     res.render("page-login-register", {
//       verified: "Your email has been verified, please login.",
//     });
//   } catch (err) {
//     console.log(err.message);
// res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
//   }
// };

//getting home page

//getting user login page
const getUserLogin = (req, res) => {
  if (req.cookies.loggedIn) {
    res.redirect("/");
  } else {
    res.render("page-login-register");
  }
};

//getting user signup page
const getUserSignup = (req, res) => {
  res.render("page-signup");
};
let userData;

//posting user details to the database
const postUserSignup = async (req, res) => {
  const formData = await user.findOne({
    email: req.body.email,
  });
  if (formData) {
    res.redirect("/page-signup", {
      error: "User with this email Already exists! Try with another email.",
    });
  } else {
    res.render("otpVerificationPage");
    // const userData = await user.findOne({
    //   username: req.body.username,
    //   email: req.body.email,
    // });
    // if (userData) {
    //   sendVerifyMail(req.body.username, req.body.email, userData._id);
    // }
    // console.log("hai");

    // , {
    //   subreddit:
    //     "The verification mail has been send, please check your inbox for the same.",
    // });
  }
};

// Editing user details
const editUserDetails = async (req, res) => {
  try {
    const existingData = await user.findOne({ email: req.user });
    const updatedData = {
      username: req.body.username,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    };

    console.log("Old one " + existingData);
    console.log(
      "New " +
        updatedData.username +
        updatedData.email +
        updatedData.phoneNumber
    );

    const changedData = {};

    if (existingData.username !== updatedData.username) {
      changedData.username = updatedData.username;
    }

    if (existingData.email !== updatedData.email) {
      changedData.email = updatedData.email;
    }

    console.log("Changed " + changedData.username + " " + changedData.email);

    if (Object.keys(changedData).length > 0) {
      console.log("Changes detected");

      // Update the user's data in the database if there are changes
      await user.updateOne({ _id: existingData._id }, { $set: changedData });
      res.redirect("/logout");
    } else if (updatedData.phoneNumber !== existingData.phoneNumber) {
      const phoneNumber = updatedData.phoneNumber;
      console.log("updatedData.phoneNumber " + updatedData.phoneNumber);
      res.render("otpVerificationPage", { phoneNumber });
    } else {
      res.redirect("/userAccount");
    }
  } catch (err) {
    console.log("An error occurred while updating the user details: " + err);
    return res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//authenticating user credentials
const postLogin = async (req, res) => {
  console.log("Hello " + req.body.password);

  const verifyStatus = await user.findOne({
    email: req.body.email,
  });
  if (!verifyStatus) {
    res.render("page-login-register", {
      subreddit: "This email is not registered!",
    });
  } else {
    if (verifyStatus) {
      if (verifyStatus.status == "Blocked") {
        res.render("page-login-register", {
          subreddit: "Your account is currently blocked!",
        });
      } else {
        console.log(verifyStatus.password);
        const password = req.body.password;
        console.log(password);
        bcrypt.compare(password, verifyStatus.password, (err, result) => {
          console.log(result);
          if (result !== true) {
            res.render("page-login-register", {
              subreddit: "Incorrect password!",
            });
          } else if (req.body.email === verifyStatus.email && result == true) {
            try {
              email = req.body.email;
              const token = jwt.sign(email, secretKey);
              res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000 });
              res.cookie("loggedIn", true, { maxAge: 24 * 60 * 60 * 1000 });
              userEmail = verifyStatus.email;
              res.redirect("/");
            } catch (err) {
              console.error(err);
              return res
                .status(500)
                .render("error-page", {
                  message: "An error happened !",
                  errorMessage: err.message,
                });
            }
          }
        });
      }
    }
  }
};

let phoneNumber;

//displaying otp verification page and sending otp
const getSendOtp = async (req, res) => {
  try {
    console.log("reached the send otp fun.");
    phoneNumber = req.body.phoneNumber;
    userData = req.body;
    console.log(phoneNumber);
    console.log(userData);
    await twilio.verify.v2.services(twilio_serviceId).verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    });
    res.json({ phoneNumber: phoneNumber });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//otp verification
const getVerifyOtp = async (req, res) => {
  try {
    console.log(userData);
    console.log(typeof phoneNumber);
    const otp = req.body.otpCode;
    console.log(otp);
    const verifyOTP = await twilio.verify.v2
      .services(twilio_serviceId)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      const referralCode = uuidv4();
      console.log("the referralCode  ="+referralCode);

      console.log("VERIFIED");
      bcrypt.hash(userData.password, 10, async (error, hash) => {
        await user.create({
          username: userData.username,
          password: hash,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          status: "Unblocked",
          isVerified: 0,
        });
        await wallet
          .create({
            userId: userData._id,
            amount: 0,
          })
          .then((data) => {
            if (data) {
              res.redirect("/");
            }
          });
      });
    } else {
      res.redirect("/page-signup", {
        error: "Incorrect O.T.P",
      });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

const getPhoneNumberChange = async (req, res) => {
  try {
    console.log("reached the send otp fun.");
    const newNumber = req.body.phoneNumber;
    console.log(newNumber);
    await twilio.verify.v2.services(twilio_serviceId).verifications.create({
      to: `+91${newNumber}`,
      channel: "sms",
    });
    res.render("phoneNumberChange", { newNumber });
  } catch (err) {
    console.error(err);
  }
};

const phoneNumberChange = async (req, res) => {
  try {
    const newNumber = req.body.phoneNumber;
    console.log(newNumber);
    const otp = req.body.otpCode;
    console.log(otp);
    const verifyOTP = await twilio.verify.v2
      .services(twilio_serviceId)
      .verificationChecks.create({
        to: `+91${newNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      console.log("VERIFIED " + newNumber);
      console.log("emial " + req.user);

      await user.updateOne(
        { email: req.user },
        { $set: { phoneNumber: newNumber } }
      );
      res.redirect("/userAccount");
    } else {
      res.redirect("/userAccount");
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//getting product page
(req, res) => {
  const loggedIn = req.user ? true : false;

  res.render("product-page", { loggedIn });
};

// for testing purpose only
const testmid = (req, res) => {
  res.render("mail-verification-login");
};

const getCouponDiscount = async (req, res) => {
  try {
    const userData = await user.findOne({ email: req.user });
    const couponCode = req.query.couponCode;
    const grandTotal = req.query.grandTotal;
    console.log(couponCode, grandTotal);

    // Find the coupon document in the database
    const couponDoc = await coupon.findOne({ code: couponCode }).exec();
    console.log(couponDoc);

    const dateNow = new Date();

    if (!couponDoc) {
      return res.status(404).json({ error: "Invalid coupon code" });
    } else if (couponDoc.redeemedUsers.includes(userData._id)) {
      return res
        .status(404)
        .json({ error: "You have already redeemed this coupon." });
    } else if (couponDoc.isActive == "Inactive") {
      return res
        .status(404)
        .json({ error: "Sorry, this coupon is currently unavailable." });
    } else if (couponDoc.expirationDate < dateNow) {
      return res
        .status(404)
        .json({ error: `Coupon is expired on ${couponDoc.expirationDate}` });
    } else if (couponDoc.minOrderAmount > grandTotal) {
      return res
        .status(404)
        .json({ error: `Minimum order amount is ${couponDoc.minOrderAmount}` });
    }

    // Calculate the discount value
    const discountValue = calculateDiscount(
      couponDoc.discountType,
      couponDoc.discountValue,
      grandTotal
    );
    console.log("calculated value  =" + discountValue);
    couponDoc.redeemedUsers.push(userData._id);
    await couponDoc.save();
    // Return the discount value and the discounted price to the client
    res.status(200).json({
      discountValue,
      discountedPrice: grandTotal - discountValue,
    });
  } catch (err) {
    console.error("An error occurred while calculating the discount!", err);
    return res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

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

//finding product
const findProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    // Fetch the product details based on the productId
    const products = await product.findById(productId);
    // console.log(products)
    if (!products) {
      // Handle the case when the product is not found
      return res.send("Product not found");
    }
    // Render the "product-page" template and pass the product details
    res.render("product-page", { products });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

const verifyReferralCode = async (req, res) => {
  try {
    const refCode = req.body.referralCode;
    const userDoc = await user.findOne({ email: req.user });
    const codeOwner = await user.findOne({ referralCode: refCode });

    if(userDoc.redeemed===true){
      return res
      .status(404)
      .json({ message: "You have already redeemed a referral code before!" });
    }

    if (!codeOwner || codeOwner._id.equals(userDoc._id)) {
      console.log("No user with that code!");
      return res.status(404).json({ message: "Invalid referral code!" });
    }

    const alreadyRedeemed = codeOwner.redeemedUsers.includes(userDoc._id);
    if (alreadyRedeemed) {
      console.log("Redeemed already: " + alreadyRedeemed);
      return res
        .status(404)
        .json({ message: "You have already used this referral code!" });
    } else {
      console.log("Not redeemed yet! Adding to wallet ");

      // Update user wallet
      await wallet.updateOne(
        { userId: userDoc._id },
        { $inc: { amount: 100 } },
        { new: true }
      );
      console.log("User wallet =  " + userDoc.amount);

      // Update owner wallet
      await wallet.updateOne(
        { userId: codeOwner._id },
        { $inc: { amount: 200 } },
        { new: true }
      );
      console.log("Owner wallet =  " + codeOwner.amount);

      // Remove redeemed referral code from owner's document
      await user.updateOne(
        { referralCode: refCode },
        { $unset: { referralCode: "" } }
      );

      // Update user document with hasRedeemed:true
      await user.updateOne({ _id: userDoc._id }, { $set: { redeemed: true } });

      // Push user ID to owner's redeemedUsers array
      await user.updateOne(
        { referralCode: refCode },
        { $push: { redeemedUsers: userDoc._id } }
      );

      console.log("Referral code redeemed successfully!");

      return res.status(200).json({ message: "Referral code verified successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).render("error-page", {
      message: "An error happened!",
      errorMessage: err.message,
    });
  }
};

//exporting functions
module.exports = {
  findProduct,
  testmid,
  getVerifyOtp,
  getSendOtp,
  postLogin,
  postUserSignup,
  getUserLogin,
  getUserAccount,
  editUserDetails,
  getUserSignup,
  getHomePage,
  logout,
  phoneNumberChange,
  getPhoneNumberChange,
  searchResults,
  getCouponDiscount,
  verifyReferralCode,
};
