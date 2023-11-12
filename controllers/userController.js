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
require("dotenv").config();
const secretKey = process.env.JWT_SECRET;
const cart = require("../model/cartModel");
const wishlist = require("../model/wishlistModel");
const coupon = require("../model/couponModel");

const getHomePage = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;

    const page = parseInt(req.query.page) || 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    
    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);

    const skip = (page - 1) * no_of_docs_each_page;

    const products = await product
      .find({ status: { $ne: "hide" } })
      .skip(skip)
      .limit(no_of_docs_each_page);

    console.log(products);

    res.render("index-4", { products, loggedIn, page, totalPages }); // Pass the 'totalPages' variable to the template
  } catch (error) {
    console.error(error);
    res.send("Error fetching products");
  }
};

module.exports = { getHomePage };


//filter mtb
const filterByMTB = async (req, res) => {
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
    const products = await product.find({ category: "MTB", status: { $ne: "hide" } });
    res.render("index-4", { products, loggedIn, totalPages, page});
  } catch (error) {
    console.log("An error occured while applying filter! " + error);
  }
};

// filter electric
const filterByElectric = async (req, res) => {
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
    const products = await product.find({ category: "E- bikes", status: { $ne: "hide" } });
    res.render("index-4", { products, loggedIn, totalPages, page });
  } catch (error) {
    console.log("An error occured while applying filter! " + error);
  }
};

// filter endurance
const filterByEndurance = async (req, res) => {
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
    const products = await product.find({ category: "Endurance bikes", status: { $ne: "hide" }});
    res.render("index-4", { products, loggedIn, totalPages, page });
  } catch (error) {
    console.log("An error occured while applying filter! " + error);
  }
};

//sorting function

// Low to High with pagination
const sortLowToHigh = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    const skip = (page - 1) * no_of_docs_each_page;

    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });

    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const loggedIn = req.cookies.loggedIn;

    const products = await product
      .find({ status: { $ne: "hide" } })
      .sort({ selling_price: 1 })
      .skip(skip)
      .limit(no_of_docs_each_page);

    res.render("index-4", { products, loggedIn, totalPages, page });
  } catch (error) {
    console.log("An error occurred while applying filter! " + error);
  }
};


// High to Low with pagination
const sortHighToLow = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    const skip = (page - 1) * no_of_docs_each_page;

    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });

    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const loggedIn = req.cookies.loggedIn;

    const products = await product
      .find({ status: { $ne: "hide" } })
      .sort({ selling_price: -1 })
      .skip(skip)
      .limit(no_of_docs_each_page);

    res.render("index-4", { products, loggedIn, totalPages, page });
  } catch (error) {
    console.log("An error occurred while applying filter! " + error);
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
  } catch (error) {
    console.log(error);
  }
};

//getting user account
const getUserAccount = async (req, res) => {
  try {
    const loggedIn = req.user ? true : false;
    console.log("User data IN REQ   " + req.user);
    const userData = await user.findOne({ email: req.user });
    console.log("User data   " + userData);
    const userAddress = await address.findOne({ userId: userData._id });
    const userWallet = await wallet.findOne({userId:userData._id});
    console.log("wallet details  "+userWallet);
    console.log("Address    " + userAddress);
    const orders = await order
      .find({ userId: userData._id })
      .sort({ orderDate: -1 })
      .populate({
        path: "products.productId",
        model: "product",
      });

    orders.forEach((order) => {
      console.log(
        "orderss  here    " + order.totalAmount + "  " + order.orderDate
      );
    });

    res.render("userDashboard", { userData, userAddress, orders, loggedIn, userWallet });
  } catch (error) {
    console.log("An error happened in fetching user dashboard " + error);
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
//   } catch (error) {
//     console.log(error.message);
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
//   } catch (error) {
//     console.log(error.message);
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
  } catch (error) {
    console.error("An error happened while sending the OTP: " + error);
    return res.status(500).json({ error: "Failed to send OTP" });
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
  } catch (error) {
    console.log("An error occured " + error);
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
  } catch (error) {
    console.error("An error occurred while changing the password: " + error);
    res
      .status(500)
      .json({ error: "An error occurred while changing the password" });
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
  } catch (error) {
    console.log("An error occurred while updating the user details: " + error);
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
            } catch (error) {
              console.error(error);
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
      console.log("VERIFIED");
      bcrypt.hash(userData.password, 10, async (error, hash) => {
        await user
          .create({
            username: userData.username,
            password: hash,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            status: "Unblocked",
            isVerified: 0,
          })
          await wallet.create({
            userId:userData._id,
            amount:0,
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
  } catch (error) {
    console.error("Error while saving address:", error);
    // Handle the error and send an error response
    res
      .status(500)
      .json({ error: "An error occurred while saving the address." });
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
  } catch (error) {
    console.log("An error");
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
  } catch (error) {
    console.log(error);
  }
};

const getCouponDiscount = async (req, res) => {
  try {
    const userData= await user.findOne({email:req.user});
    const couponCode = req.query.couponCode;
    const grandTotal = req.query.grandTotal;
    console.log(couponCode,grandTotal);

    // Find the coupon document in the database
    const couponDoc = await coupon.findOne({ code: couponCode }).exec();
    console.log(couponDoc);

    const dateNow= new Date();

    if (!couponDoc) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }
    else if(couponDoc.redeemedUsers.includes(userData._id)){
      return res.status(404).json({ error: 'You have already redeemed this coupon.' });
    }
    else if(couponDoc.isActive=="Inactive"){
      return res.status(404).json({ error: 'Sorry, this coupon is currently unavailable.' });
    }
    else if (couponDoc.expirationDate < dateNow) {
      return res.status(404).json({ error: `Coupon is expired on ${couponDoc.expirationDate}`  });
    }
    else if(couponDoc.minOrderAmount>grandTotal){
      return res.status(404).json({ error: `Minimum order amount is ${couponDoc.minOrderAmount}` });
    }

    // Calculate the discount value
    const discountValue = calculateDiscount(couponDoc.discountType, couponDoc.discountValue,grandTotal);
    console.log("calculated value  ="+discountValue);
    couponDoc.redeemedUsers.push(userData._id);
    await couponDoc.save();
    // Return the discount value and the discounted price to the client
    res.status(200).json({
      discountValue,
      discountedPrice: grandTotal - discountValue
    });
  } catch (error) {
    console.error('An error occurred while calculating the discount!', error);
    res.status(500).json({ error: 'An error occurred while calculating the discount!.' });
  }
};

const calculateDiscount = (discountType, discountValue, grandTotal) => {
  switch (discountType) {
    case 'fixedAmount':
      return discountValue;
    case 'percentage':
      return (discountValue / 100) * grandTotal;
    default:
      return 0;
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
  } catch (error) {
    console.error("An error occurred while placing the order: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while placing the order." });
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
        res.status(200).json({ message: "Order placed successfully.", razorOrder });
      }
    });
  } catch (error) {
    console.error("An error occurred while placing the order: ", error);
    res.status(500).json({ error: "An error occurred while placing the order." });
  }
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
  }} catch (error) {
    console.error("An error occurred while placing the order: ", error);
    res.status(500).json({ error: "An error occurred while placing the order." });
  }
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
  catch(error){
    res.status(500);
  }
}




//get order placed
const getOrderPlaced= (req, res)=>{
  res.render("orderPlaced")
};









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
  } catch (error) {
    console.log("An error happened while loading the order details! :" + error);
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
  } catch (error) {
    console.error(error);
    res.send("Error fetching product details");
  }
};

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
  } catch (error) {
    console.error("Error while loading cart:", error);
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
      res.json({ message: "Product added to the cart" });
    
    } catch (error) {
      console.error("Error adding to cart:", error);
      // res.status(500).json({ error: "Failed to add the product to the cart" });
    }
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
    const updatedSubtotal =
      Number(productInCart.productId.selling_price) * productInCart.quantity;

    // Create a response object with the updated quantity and subtotal
    const response = {
      updatedQuantity: productInCart.quantity,
      updatedSubtotal,
    };

    return res.json(response);
  } catch (error) {
    console.log("An error occurred while modifying quantity: " + error);
    return res
      .status(500)
      .json({ error: "An error occurred while modifying quantity" });
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
  } catch (error) {
    console.error("Error removing the product from the cart: " + error);
    res.sendStatus(500); // Send a server error status code
  }
};

//checkout from cart
const getCartCheckout = async (req, res) => {
  try {
    const coupons= await coupon.find();
    const loggedIn = req.user ? true : false;
    const userData = await user.findOne({ email: req.user });
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId",
      model: "product",
    });

    const userAddress = await address.findOne({ userId: userData._id });
    if (!userAddress) {
      res.redirect("/addAddress");
    } else {
      res.render("checkout", { userCart, loggedIn, userAddress, coupons });
    }
  } catch (error) {
    console.log("An error happened while loading checkout page." + error);
  }
};

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
  } catch (error) {
    console.error("Error while loading wishlist:", error);
    // Handle the error as needed
  }
  };

  //add to wishlist
const addToWishlist= async (req, res)=>{
  try{
    const loggedIn = req.user ? true : false;
    const userData= await user.findOne({email:req.user});
    let userWishlist = await wishlist.findOne({ userId: userData._id }).populate({
      path: "products.productId",
      model: "product",
    });
    if(!userWishlist){
      userWishlist = new wishlist({
        userId: userData._id,
        products: [],
      });     
    }else{
      const productId= req.body.productId;
      console.log("product ID  "+productId);
      userWishlist.products.push({
        productId: new mongoose.Types.ObjectId(productId),
      }); 
    }
    await userWishlist.save();
    res.json({ message: "Product added to the wishlist." });
  }
  catch(error){
    console.log("An error happened while adding the product to wishlist!:"+error);
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
  } catch (error) {
    console.error("Error moving to cart:", error);
    // res.status(500).json({ error: "Failed to add the product to the cart" });
  }
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
  } catch (error) {
    console.log("An error happened while deleting the product from wishlist: " + error);
  }
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
  } catch (error) {
    console.log("An error happened while processig return! :" + error);
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
  } catch (error) {
    console.log("An error happened while processig return! :" + error);
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
  getForgotPassword,
  getResetPasswordOtp,
  verifyForgotPasswordOtp,
  getResetPassword,
  changePassword,
  getUserSignup,
  getHomePage,
  logout,
  getCart,
  addToCartController,
  postCartQty,
  removeProductFromCart,
  getCartCheckout,
  getWishlist,
  addToWishlist,
  moveToCart,
  deleteFromWishlist,
  getAddAddress,
  postAddAddress,
  cartOrder,
  razorpayOrder,
  walletOrder,
  getOrderDetails,
  productCancel,
  productReturn,
  filterByEndurance,
  filterByElectric,
  filterByMTB,
  sortHighToLow,
  sortLowToHigh,
  phoneNumberChange,
  getPhoneNumberChange,
  searchResults,
  getEditAddress,
  postEditAddress,
  getOrderPlaced,
  paymentStatus,
  getCouponDiscount,
};
