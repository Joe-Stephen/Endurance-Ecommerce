require('dotenv').config()
const user = require("../model/userModel");
const nodemailer = require("nodemailer");
const twilio_account_sid=process.env.twilio_account_sid;
const twilio_auth_token=process.env.twilio_auth_token;
const twilio_serviceId=process.env.twilio_serviceId;
const twilio = require('twilio')(twilio_account_sid, twilio_auth_token);
const product = require("../model/productModel");
const jwt=require("jsonwebtoken")
require('dotenv').config()
const secretKey=process.env.JWT_SECRET;

console.log(secretKey)

//getting user home page
const getHomePage = async (req,res)=>{
  try{
      const products= await product.find();
      // console.log(products)
      res.render('index-4',{products:products});
  }catch(error){
      console.error(error);
      res.send('Error fetching products');
  }
};

const logout=(req, res)=>{
  
  // console.log(req.user)
  // console.log(req.cookies.token)
  res.clearCookie("token")
  res.redirect('/loginPage')
}

let isOtpVerified=false;

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

//getting user signup page
const getUserSignup = (req, res) => {
  res.render("page-signup");
};
let phoneNumber;

  //posting user details to the database
  const postUserSignup = async (req, res) => {
    const formData = await user.findOne({
      email: req.body.email,
    });
    if (formData) {
      res.render("page-signup", {error: "User with this email Already exists! Try with another email.",
    });
    } else {
      if(isOtpVerified)
      {
        await user.create({
          username: req.body.username,
          password: req.body.password,
          confirm_password: req.body.confirm_password,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          otpInput: req.body.otpInput,
          status:"Unblocked",
          isVerified: 0,
        });
        // const userData = await user.findOne({
        //   username: req.body.username,
        //   email: req.body.email,
        // });
        // if (userData) {
        //   sendVerifyMail(req.body.username, req.body.email, userData._id);
        // }
        // console.log("hai");

        res.render("page-login-register");
        // , {
        //   subreddit:
        //     "The verification mail has been send, please check your inbox for the same.",
        // });
      }else{
        res.render("page-signup",{
          error: "Incorrect O.T.P",
        });
      }
    }
  };

//authenticating user credentials
const getUserHomePage = async (req, res) => {
  const verifyStatus = await user.findOne({
    email: req.body.email
  });
  if (!verifyStatus) {
    res.redirect("page-login-register", {
      subreddit: "This email is not registered!",
    });
  } else {
    if (verifyStatus) {
      if (verifyStatus.status=="Blocked"){
        res.redirect("page-login-register", { subreddit: "Your account is currently blocked!" });
      } else if (req.body.password !== verifyStatus.password) {
        res.redirect("page-login-register", { subreddit: "Incorrect password!" });
      } else {
        if (
          req.body.email === verifyStatus.email &&
          req.body.password === verifyStatus.password
        ) {
          try{
            email = req.body.email;
            const token = jwt.sign(email, secretKey);
            res.cookie('token', token);
            console.log("joe");
            console.log(req.cookies);            
            const products= await product.find();
            res.render('index-4',{products:products,message: "User Logged in Successfully" });
          }catch(error){
            console.error(error);
            // res.send('Error fetching products');
        }
        }
      }
    } else {
      console.log("hallooo")
      res.redirect("/");
    }
  }
};

const getSendOtp = async (req, res) => {
  try {
    console.log("hai")
    phoneNumber = req.query.phoneNumber;
    await twilio.verify.v2.services(twilio_serviceId).verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    });
  } catch (err) {
    console.error(err);
  }
};

const getVerifyOtp = async (req, res) => {
  try {
    const otp = req.query.otp;
    const verifyOTP = await twilio.verify.v2
      .services(twilio_serviceId)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      isOtpVerified = true;
    } else {
      isOtpVerified = false;
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

const findProduct= async (req, res) => {
  try {
    const productId = req.params.productId;
    // Fetch the product details based on the productId
    const products = await product.findById(productId);
    // console.log(products)

    if (!products) {
        // Handle the case when the product is not found
        return res.send('Product not found');
    }

    // Render the "product-page" template and pass the product details
    res.render('product-page', { products});
} catch (error) {
    console.error(error);
    res.send('Error fetching product details');
}
}

module.exports={findProduct, testmid, getVerifyOtp, 
  getSendOtp, getUserHomePage, postUserSignup, getUserRoute, getUserSignup,
   getHomePage,logout}