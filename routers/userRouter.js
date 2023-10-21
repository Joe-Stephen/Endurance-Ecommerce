const express=require('express');
const app=express();
const userRouter=express.Router();
const userController=require("../controllers/userController")
const product = require("../model/productModel");


userRouter.route('/loginPage')
.get(userController.getUserRoute);

//user signup page
userRouter.route("/page-signup")
.get(userController.getUserSignup)

 //posting user signup details
userRouter.route("/signup_submit")
.post(userController.postUserSignup)

userRouter.get("/send_otp",userController.getSendOtp)
userRouter.post("/verify_otp",userController.getVerifyOtp)


//otp sending 
// userRouter.route("/signup_submit")
// .post(userController.getSendOtp)

// userRouter.route("/verify-email")
// .get(userController.verifyEmail)


//user login
userRouter.route("/index-4")
.post(userController.getUserHomePage);
module.exports = userRouter;



// test routes
userRouter.route("/test")
.get(userController.testmid)




