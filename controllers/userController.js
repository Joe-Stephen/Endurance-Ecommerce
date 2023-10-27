require("dotenv").config();
const user = require("../model/userModel");
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

console.log(secretKey);
//getting user home page
const getHomePage = async (req, res) => {
  try {
    const products = await product.find();
    // console.log(products)
    res.render("index-4", { products: products });
  } catch (error) {
    console.error(error);
    res.send("Error fetching products");
  }
};

const checkUserAuth = (req, res) => {
  res.status(200).send("You are authenticated!");
};

const logout = (req, res) => {
  // console.log(req.user)
  // console.log(req.cookies.token)
  res.clearCookie("token");
  res.redirect("/loginPage");
};

let isOtpVerified = false;

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
const getUserRoute = (req, res) => {
  res.render("page-login-register");
};

//getting forgot password page
const getForgotPassword=(req, res)=>{
  res.render('forgot-Password')
}

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

      // Assuming you have initialized twilio_serviceId correctly
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
const verifyForgotPasswordOtp= async(req, res)=>{
  try{
    const phoneNumber=req.body.phoneNumber;
    const otp=req.body.otpCode;
    const verifyOTP = await twilio.verify.v2
    .services(twilio_serviceId)
    .verificationChecks.create({
      to: `+91${phoneNumber}`,
      code: otp,
    });
    if (verifyOTP.valid) {
      console.log("VERIFIED");
}
}
catch(error){
  console.log("An error occured "+error);
  res.render("forgot-password");
}
};
const getResetPassword=(req, res)=>{
  let phoneNumber=req.params.phoneNumber;
  res.render("resetPassword", { phoneNumber });
}

    // Update the user's password
    const changePassword=async(req, res)=>{
      try{
        const phoneNumber=req.body.phoneNumber;
        console.log(phoneNumber)
        const newPassword=req.body.password1;
        const userData=await user.findOne({phoneNumber:phoneNumber});
        if (!userData) {
          return res.status(404).json({ error: "User not found" });
        }
        userData.password = newPassword;
        await userData.save();
        res.redirect("/loginPage")
      } catch (error) {
    console.log("An error occurred while changing the password: " + error);
    res.status(500).json({ error: "An error occurred while changing the password" });
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

//authenticating user credentials
const getUserHomePage = async (req, res) => {
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
        res.redirect("page-login-register", {
          subreddit: "Your account is currently blocked!",
        });
      } else if (req.body.password !== verifyStatus.password) {
        res.render("page-login-register", {
          subreddit: "Incorrect password!",
        });
      } else {
        if (
          req.body.email === verifyStatus.email &&
          req.body.password === verifyStatus.password
        ) {
          try {
            email = req.body.email;
            const token = jwt.sign(email, secretKey);
            res.cookie("token", token);
            const products = await product.find();
            userEmail = verifyStatus.email;
            res.render("index-4", {
              products: products,
              message: "User Logged in Successfully",
            });
          } catch (error) {
            console.error(error);
            // res.send('Error fetching products');
          }
        }
      }
    } else {
      console.log("hallooo");
      res.redirect("/");
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
    res.json({ phoneNumber:phoneNumber });
  } catch (err) {
    console.error(err);
  }
};

//otp verification
const getVerifyOtp = async (req, res) => {
  try {
    console.log(userData);
    console.log(phoneNumber);
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
      await user.create({
        username: userData.username,
        password: userData.password,
        confirm_password: userData.confirm_password,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        status: "Unblocked",
        isVerified: 0,
      });
      res.redirect("/");
    } else {
      res.redirect("/page-signup", {
        error: "Incorrect O.T.P",
      });
    }
  } catch (err) {
    console.error(err);
  }
};

//getting product page
(req, res) => {
  res.render("product-page");
};

// for testing purpose only
const testmid = (req, res) => {
  res.render("mail-verification-login");
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
    const userData = await user.findOne({ email: req.user });
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId", // Specify the path to the product ID in the cart's products array
      model: "product", // Reference the 'product' model
    });
    // The 'userCart' now contains the populated 'products' array with product details
    // You can access these details in your template
    res.render("cart", { userCart });
  } catch (error) {
    console.error("Error while loading cart:", error);
    // Handle the error as needed
  }
};

//function for adding product to cart
const addToCartController = async (req, res) => {
  try {
    // Extract user ID and product ID from the request
    const { productId } = req.body;
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

//exporting functions
module.exports = {
  findProduct,
  testmid,
  getVerifyOtp,
  getSendOtp,
  getUserHomePage,
  checkUserAuth,
  postUserSignup,
  getUserRoute,
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
};