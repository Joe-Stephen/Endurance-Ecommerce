require("dotenv").config();
const user = require("../model/userModel");
const address= require("../model/addressModel");
const order= require("../model/orderModel")
const returns= require("../model/returnModel")
const cancels= require("../model/cancelModel")
const bcrypt = require('bcrypt')
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


const getHomePage = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;


    const page = req.query.page ?? 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    console.log(page)
    const totalProducts = await product.countDocuments({ status: { $ne: "hide" } });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);

    const skip = (page - 1) * no_of_docs_each_page;

    const products = await product
      .find({ status: { $ne: "hide" } })
      .skip(skip)
      .limit(no_of_docs_each_page);

      console.log(products)

    res.render("index-4", { products, loggedIn, page, totalPages }); // Pass the 'totalPages' variable to the template
  } catch (error) {
    console.error(error);
    res.send("Error fetching products");
  }
};




//filter by category
const filterByMTB= async (req, res)=>{
  try{
    const loggedIn=req.cookies.loggedIn;
    const products= await product.find({category:"MTB"})
    res.render("index-4",{products,loggedIn});
  }
  catch(error){
    console.log("An error occured while applying filter! "+error);
  }
}

const filterByElectric= async (req, res)=>{
  try{
    const loggedIn=req.cookies.loggedIn;
    const products= await product.find({category:"E- bikes"})
    res.render("index-4",{products,loggedIn});
  }
  catch(error){
    console.log("An error occured while applying filter! "+error);
  }
}

const filterByEndurance= async (req, res)=>{
  try{
    const loggedIn=req.cookies.loggedIn;
    const products= await product.find({category:"Endurance bikes"})
    res.render("index-4",{products,loggedIn});
  }
  catch(error){
    console.log("An error occured while applying filter! "+error);
  }
}

//search results in the home page
const searchResults= async (req, res)=>{
  try{
    const loggedIn = req.cookies.loggedIn;
    const searchQuery = req.query.searchHomeValue;
    const regex = new RegExp(searchQuery, "i");
    const products = await product.find({ name: regex });
    let result="";
    if (products.length === 0) {
      result="No products found...";

    } else {
      result="We found these...";
    }
    res.render("index-4", { result, products, loggedIn });
  }
  catch (error) {
    console.log(error);
  }
};



//getting user account
const getUserAccount = async (req, res) => {
  try {
    const loggedIn = req.user ? true : false;
    console.log("User data IN REQ   "+req.user)
    const userData = await user.findOne({ email: req.user });
    console.log("User data   "+userData)
    const userAddress = await address.findOne({ userId: userData._id });    
    console.log("Address    "+userAddress);
    const orders = await order.find({ userId: userData._id }).populate({
      path: "products.productId",
      model: "product",
    });

      res.render("userDashboard", { userData, userAddress, orders, loggedIn });

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
  res.redirect('/getLogin')
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
  if(req.cookies.loggedIn){
    res.redirect('/')
  }else{
    res.render("page-login-register");
  }
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
const changePassword = async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    console.log("number " + phoneNumber);
    console.log("new pass " + req.body.password1);

    // Hash the new password
    bcrypt.hash(req.body.password1, 10, async (err, hash) => {
      if (err) {
        console.error("Error hashing the password: " + err);
        res.status(500).json({ error: "An error occurred while changing the password" });
      } else {
        // Update the user's password with the hashed value using findOneAndUpdate
        await user.findOneAndUpdate({ phoneNumber: phoneNumber }, { $set: { password: hash } });
        console.log("Password updated successfully");
        res.redirect("/getLogin");
      }
    });
  } catch (error) {
    console.error("An error occurred while changing the password: " + error);
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
    console.log("New " + updatedData.username + updatedData.email + updatedData.phoneNumber);

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
      const phoneNumber=updatedData.phoneNumber;
      console.log("updatedData.phoneNumber "+updatedData.phoneNumber);
      res.render("otpVerificationPage", {phoneNumber});
    } else {
      res.redirect("/userAccount");
    }
  } catch (error) {
    console.log("An error occurred while updating the user details: " + error);
  }
};

//authenticating user credentials
const postLogin = async (req, res) => {
  console.log("Hello "+req.body.password);
  
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
          console.log(verifyStatus.password)
          const password=req.body.password;
          console.log(password)
          bcrypt.compare(password,verifyStatus.password, (err, result) => {
            console.log(result);
           if (result!==true) {
             res.render("page-login-register", {
               subreddit: "Incorrect password!",
             });      
          } else if (
            req.body.email === verifyStatus.email &&
            result==true
            ) {
              try {
              email = req.body.email;
              const token = jwt.sign(email, secretKey);
              res.cookie("token", token,  { maxAge: 24 * 60 * 60 * 1000 });
              res.cookie("loggedIn", true,  { maxAge: 24 * 60 * 60 * 1000 });
              userEmail = verifyStatus.email;
              res.redirect("/");
            } catch (error) {
              console.error(error);
            }
          }
        });
      }
    }}
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
      bcrypt.hash(userData.password, 10, async (error, hash)=>{
        await user.create({
        username: userData.username,
        password: hash,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        status: "Unblocked",
        isVerified: 0,
      }).then((data)=>{
        if(data){
          res.redirect("/");
        }
      })
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

const getPhoneNumberChange= async (req, res) => {
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




const phoneNumberChange=async (req, res)=>{
  try{
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
        console.log("VERIFIED "+newNumber);
        console.log("emial "+req.user);

        await user.updateOne({email:req.user},{$set:{phoneNumber:newNumber}});
        res.redirect("/userAccount")
  }else {
    res.redirect("/userAccount");
  }
}
catch (err) {
  console.error(err);
}
};



//getting product page
(req, res) => {
  const loggedIn=req.user?true:false;

  res.render("product-page",{loggedIn});
};

// for testing purpose only
const testmid = (req, res) => {
  res.render("mail-verification-login");
};

//getting add address
const getAddAddress= (req, res)=>{
      res.render("addressCreation")
}

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
    res.redirect('/userAccount');
  } catch (error) {
    console.error('Error while saving address:', error);
    // Handle the error and send an error response
    res.status(500).json({ error: 'An error occurred while saving the address.' });
  }
};

//placing order with saving order details
const postCartOrder = async (req, res) => {
  try {
    const userData = await user.findOne({ email: req.user });
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId",
      model: "product",
    });
    // let userCart=req.body.userCart;
    let orderTotal = 0;
    let orderProducts = [];

    userCart.products.forEach((product) => {
      const orderProduct = {
        productId: product.productId._id,
        price: product.productId.selling_price,
        quantity: product.quantity,
      };

      orderTotal += orderProduct.price * orderProduct.quantity;
      orderProducts.push(orderProduct);
    });

    const newOrder= await order.create({
      userId:userCart.userId,
      products:orderProducts,
      orderDate:new Date(),
      totalAmount:orderTotal,
      paymentMethod:req.body.payment_option,      
    })
    // res.status(200).json({ message: "Order placed successfully.", order: userOrder });
    await cart.deleteOne({userId:userData._id});
    res.render("orderPlaced")
  } catch (error) {
    console.error("An error occurred while placing the order: ", error);
    res.status(500).json({ error: "An error occurred while placing the order." });
  }
};

//getting order details
const getOrderDetails=async (req, res)=>{
  try{
    const orderId=req.params.orderId;
    const userData = await user.findOne({ email: req.user });
    const orderDetails = await order.findById({_id:orderId}).populate({
      path: "products.productId",
      model: "product",
    }); 
    res.render("orderDetails",{orderDetails})  
  }
  catch(error){
    console.log("An error happened while loading the order details! :"+error);
  }
}





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
    res.render("product-page", { products});
  } catch (error) {
    console.error(error);
    res.send("Error fetching product details");
  }
};

//getting cart
const getCart = async (req, res) => {
  try {
    const loggedIn=req.user?true:false;
    const userData = await user.findOne({ email: req.user });
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId",
      model: "product",
    });
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
      existingProduct.quantity+=1;
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
const   postCartQty = async (req, res) => {
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
const getCartCheckout= async (req, res)=>{
  try{
    const loggedIn=req.user?true:false;
    const userData= await user.findOne({email:req.user});
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId",
      model: "product",
    });

    const userAddress= await address.findOne({userId:userData._id});
    if(!userAddress){
      res.redirect("/addAddress")
    }else{
      res.render("checkout",{userCart, loggedIn, userAddress})
    }
  }
  catch(error){
    console.log("An error happened while loading checkout page."+error);
  }
}

//handling returns
const productReturn=async (req, res)=>{
  try{
    const userData= await user.findOne({email:req.user});
    let userReturn= await returns.findOne({userId:userData._id});
    if(!userReturn){
      userReturn= new returns({
        userId:userData._id,
        orders:[{
          orderId:req.body.orderID,
          reason:req.body.reason,
        }]
      })
    }else{
      userReturn.orders.push({
        orderId:req.body.orderID,
        reason:req.body.reason,
      })
    }
    await userReturn.save();
    await order.updateOne({ _id: req.body.orderID }, { $set: { orderStatus: "Returned" } });
    res.redirect("/userAccount");
  }
  catch(error){
    console.log("An error happened while processig return! :"+error);
  }
}

//handling cancels
const productCancel=async (req, res)=>{
  try{
    const userData= await user.findOne({email:req.user});
    let userCancel= await cancels.findOne({userId:userData._id});
    if(!userCancel){
      userCancel= new cancels({
        userId:userData._id,
        orders:[{
          orderId:req.body.orderID,
          reason:req.body.reason,
        }]
      })
    }else{
      userCancel.orders.push({
        orderId:req.body.orderID,
        reason:req.body.reason,
      })
    }
    await userCancel.save();
    await order.updateOne({ _id: req.body.orderID }, { $set: { orderStatus: "Cancelled" } });

    res.redirect("/userAccount");
  }
  catch(error){
    console.log("An error happened while processig return! :"+error);
  }
}

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
  getAddAddress,
  postAddAddress,
  postCartOrder,
  getOrderDetails,
  productCancel,
  productReturn,
  filterByEndurance,
  filterByElectric,
  filterByMTB,
  phoneNumberChange,
  getPhoneNumberChange,
  searchResults,
};