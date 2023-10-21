const user = require("../model/userModel");
const nodemailer = require("nodemailer");
const twilio = require('twilio')('AC90b10edd5b6aa7b69d4834d521e5f0ac', '56c2bba00524d602bd7cfc9a500f607a');
const product = require("../model/productModel");


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

// module.exports.verifyEmail = async (req, res) => {
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

//getting user login page
module.exports.getUserRoute = (req, res) => {
  res.render("page-login-register");
};

//getting user signup page
module.exports.getUserSignup = (req, res) => {
  res.render("page-signup");
};
let phoneNumber;

  //posting user details to the database
  module.exports.postUserSignup = async (req, res) => {
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
module.exports.getUserHomePage = async (req, res) => {
  const verifyStatus = await user.findOne({
    email: req.body.email
  });
  if (!verifyStatus) {
    res.render("page-login-register", {
      subreddit: "This email is not registered!",
    });
  } else {
    if (verifyStatus) {
      if (verifyStatus.status=="Blocked"){
        res.render("page-login-register", { subreddit: "Your account is currently blocked!" });
      } else if (req.body.password !== verifyStatus.password) {
        res.render("page-login-register", { subreddit: "Incorrect password!" });
      } else {
        if (
          req.body.email === verifyStatus.email &&
          req.body.password === verifyStatus.password
        ) {
          try{
            const products= await product.find();
            console.log(products)
            res.render('index-4',{products:products});
          }catch(error){
            console.error(error);
            res.status(500).send('Error fetching products');
        }

        }
      }
    } else {
      res.redirect("/");
    }
  }
};

module.exports.getSendOtp = async (req, res) => {
  try {
    console.log("hai")
    phoneNumber = req.query.phoneNumber;
    await twilio.verify.v2.services('VA0a7643a8b2f3c658965ec15e84a4632c').verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    });
  } catch (err) {
    console.error(err);
  }
};




module.exports.getVerifyOtp = async (req, res) => {
  try {
    const otp = req.query.otp;
    const verifyOTP = await twilio.verify.v2
      .services('VA0a7643a8b2f3c658965ec15e84a4632c')
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
module.exports.getProductPage = (req, res) => {
  res.render("product-page");
};


module.exports.testmid = (req, res) => {
  res.render("mail-verification-login");
};