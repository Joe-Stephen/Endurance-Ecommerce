const express = require("express");
const adminRouter = express.Router();
const userRouter = express.Router();
const userController = require("../controllers/userController");
const product = require("../model/productModel");
const jwt = require("jsonwebtoken");
const userMiddleware = require("../middlewares/user/userAuthentication");
const cookieParser = require("cookie-parser");
userRouter.use(cookieParser());

userRouter.get("/", userController.getHomePage);
userRouter.get("/getLogin", userController.getUserLogin);
userRouter.post("/postLogin", userController.postLogin);






userRouter.get("/page-signup", userController.getUserSignup);
userRouter.get("/logout", userController.logout);
userRouter.get("/product/:productId", userController.findProduct);

//filter by category
userRouter.get("/filterByMTB", userController.filterByMTB);
userRouter.get("/filterByElectric", userController.filterByElectric);
userRouter.get("/filterByEndurance", userController.filterByEndurance);

//sorting routes
userRouter.get("/sort-LowToHigh", userController.sortLowToHigh);
userRouter.get("/sort-HighToLow", userController.sortHighToLow);
userRouter.get("/sort-priceRange/:priceRange", userController.sortPriceRange);





//search product 
userRouter.get("/searchHome",userMiddleware.verifyUser, userController.searchResults);




userRouter.get("/toVerifyPage", userController.postUserSignup);
userRouter.post("/send_otp", userController.getSendOtp);
userRouter.post("/getOtpPhoneNumChange", userMiddleware.verifyUser,  userController.getPhoneNumberChange);
userRouter.post("/verifyOtpPhoneNumChange", userMiddleware.verifyUser,  userController.phoneNumberChange);
userRouter.post("/verifyOTPnow", userController.getVerifyOtp);
userRouter.get("/userAccount", userMiddleware.verifyUser, userController.getUserAccount);
userRouter.post("/editUserDetails", userMiddleware.verifyUser, userController.editUserDetails);
userRouter.get("/addAddress", userMiddleware.verifyUser, userController.getAddAddress);
userRouter.post("/postAddress", userMiddleware.verifyUser, userController.postAddAddress);
userRouter.get("/editAddress", userMiddleware.verifyUser, userController.getEditAddress);
userRouter.post("/postEditAddress", userMiddleware.verifyUser, userController.postEditAddress);


//coupon
userRouter.post("/getCouponValue", userMiddleware.verifyUser, userController.getCouponDiscount);



//order
userRouter.get("/orderDetails/:orderId", userMiddleware.verifyUser, userController.getOrderDetails);
userRouter.post("/codOrder", userMiddleware.verifyUser, userController.cartOrder);
userRouter.post("/razorpayOrder", userMiddleware.verifyUser, userController.razorpayOrder);
userRouter.post("/walletOrder", userMiddleware.verifyUser, userController.walletOrder);
userRouter.get("/orderPlaced", userMiddleware.verifyUser, userController.getOrderPlaced);
userRouter.get("/paymentStatus", userMiddleware.verifyUser, userController.paymentStatus);
userRouter.post("/returnOrder",userMiddleware.verifyUser, userController.productReturn);
userRouter.post("/cancelOrder",userMiddleware.verifyUser, userController.productCancel);




//cart
userRouter.get("/cart", userMiddleware.verifyUser, userController.getCart);
userRouter.post("/addToCart", userMiddleware.verifyUser, userController.addToCartController);
userRouter.post("/cartQtyChange", userMiddleware.verifyUser, userController.postCartQty);
userRouter.delete("/removeProductFromCart/:productId", userMiddleware.verifyUser, userController.removeProductFromCart);
userRouter.get("/checkoutFromCart",  userMiddleware.verifyUser,userController.getCartCheckout);

//wishlist
userRouter.get("/wishlist", userMiddleware.verifyUser, userController.getWishlist);
userRouter.post("/addToWishlist", userMiddleware.verifyUser, userController.addToWishlist);
userRouter.get("/moveToCart", userMiddleware.verifyUser, userController.moveToCart);
userRouter.get("/deleteFromWishlist", userMiddleware.verifyUser, userController.deleteFromWishlist);




//password change
userRouter.get("/forgot_password", userController.getForgotPassword);
userRouter.post("/sendOTPRoute", userController.getResetPasswordOtp);
userRouter.post("/verifyOTPRoute", userController.verifyForgotPasswordOtp);
userRouter.get("/resetPassword/:phoneNumber", userController.getResetPassword);
userRouter.post("/changePassword", userController.changePassword);



// test routes
userRouter.route("/test").get(userController.testmid);

// adminRouter.use(express.static("public/adminAssets/assets"));
// const multer = require("multer");
// const path = require("path");

// adminRouter.use("/uploads",express.static('/uploads'));
// adminRouter.use(cookieParser)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './uploads');
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });
// const upload=multer({storage:storage})

// userRouter.get("/admin", userController.getAdminLogin);
// userRouter.get("/admin-dashboard",userController.getAdminDashboard);
// userRouter.post("/admin-dashboard", userController.getAdminDashboard);
// userRouter.get("/admin-user-management", userController.getUsers);
// userRouter.get("/admin-products-list", userController.getProductsList);
// userRouter.get("/admin-add-product", userController.getAddProduct);
// userRouter.post("/add-product",upload.array("photo"), userController.postAddProduct);
// userRouter.post("/update-user-status/:userId", userController.postUserStatus);
// userRouter.post("/product/:productId",userController.postProductStatus);
// userRouter.get("/edit-product",userController.getEditProduct);
// userRouter.post("/post-edit-product/:productId",upload.array("photo"),userController.postEditProduct);
// userRouter.get("/admin-category-management",userController.getCategories);
// userRouter.post("/add-category",upload.single("icon"),userController.postAddCategory);

module.exports = userRouter;
