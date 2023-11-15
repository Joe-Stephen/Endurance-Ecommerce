const express = require("express");
const adminRouter = express.Router();
const userRouter = express.Router();
const userController = require("../controllers/userController");
const userFilterAndSort = require("../controllers/userFilterAndSort");
const userAddress = require("../controllers/userAddress");
const userOrder = require("../controllers/userOrder");
const userCart = require("../controllers/userCart");
const userWishlist = require("../controllers/userWishlist");
const userPassword = require("../controllers/userPassword");







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
userRouter.get("/filterByMTB", userFilterAndSort.filterByMTB);
userRouter.get("/filterByElectric", userFilterAndSort.filterByElectric);
userRouter.get("/filterByEndurance", userFilterAndSort.filterByEndurance);

//sorting routes
userRouter.get("/sort-LowToHigh", userFilterAndSort.sortLowToHigh);
userRouter.get("/sort-HighToLow", userFilterAndSort.sortHighToLow);
userRouter.get("/sort-priceRange/:priceRange", userFilterAndSort.sortPriceRange);
userRouter.get("/sortByBrand", userFilterAndSort.sortByBrand);

//search product
userRouter.get(
    "/searchHome",
    userMiddleware.verifyUser,
    userController.searchResults
);

userRouter.get("/toVerifyPage", userController.postUserSignup);
userRouter.post("/send_otp", userController.getSendOtp);
userRouter.post(
    "/getOtpPhoneNumChange",
    userMiddleware.verifyUser,
    userController.getPhoneNumberChange
);
userRouter.post(
    "/verifyOtpPhoneNumChange",
    userMiddleware.verifyUser,
    userController.phoneNumberChange
);
userRouter.post("/verifyOTPnow", userController.getVerifyOtp);
userRouter.get(
    "/userAccount",
    userMiddleware.verifyUser,
    userController.getUserAccount
);
userRouter.post(
    "/editUserDetails",
    userMiddleware.verifyUser,
    userController.editUserDetails
);

//address handlers
userRouter.get(
    "/addAddress",
    userMiddleware.verifyUser,
    userAddress.getAddAddress
);
userRouter.post(
    "/postAddress",
    userMiddleware.verifyUser,
    userAddress.postAddAddress
);
userRouter.get(
    "/editAddress",
    userMiddleware.verifyUser,
    userAddress.getEditAddress
);
userRouter.post(
    "/postEditAddress",
    userMiddleware.verifyUser,
    userAddress.postEditAddress
);

//coupon
userRouter.post(
    "/getCouponValue",
    userMiddleware.verifyUser,
    userController.getCouponDiscount
);

//order
userRouter.get(
    "/orderDetails/:orderId",
    userMiddleware.verifyUser,
    userOrder.getOrderDetails
);
userRouter.post(
    "/codOrder",
    userMiddleware.verifyUser,
    userOrder.cartOrder
);
userRouter.post(
    "/razorpayOrder",
    userMiddleware.verifyUser,
    userOrder.razorpayOrder
);
userRouter.post(
    "/walletOrder",
    userMiddleware.verifyUser,
    userOrder.walletOrder
);
userRouter.get(
    "/orderPlaced",
    userMiddleware.verifyUser,
    userOrder.getOrderPlaced
);
userRouter.get(
    "/paymentStatus",
    userMiddleware.verifyUser,
    userOrder.paymentStatus
);
userRouter.post(
    "/returnOrder",
    userMiddleware.verifyUser,
    userOrder.productReturn
);
userRouter.post(
    "/cancelOrder",
    userMiddleware.verifyUser,
    userOrder.productCancel
);

//cart
userRouter.get("/cart", userMiddleware.verifyUser, userCart.getCart);
userRouter.post(
    "/addToCart",
    userMiddleware.verifyUser,
    userCart.addToCartController
);
userRouter.post(
    "/cartQtyChange",
    userMiddleware.verifyUser,
    userCart.postCartQty
);
userRouter.delete(
    "/removeProductFromCart/:productId",
    userMiddleware.verifyUser,
    userCart.removeProductFromCart
);
userRouter.get(
    "/checkoutFromCart",
    userMiddleware.verifyUser,
    userCart.getCartCheckout
);

//wishlist
userRouter.get(
    "/wishlist",
    userMiddleware.verifyUser,
    userWishlist.getWishlist
);
userRouter.post(
    "/addToWishlist",
    userMiddleware.verifyUser,
    userWishlist.addToWishlist
);
userRouter.get(
    "/moveToCart",
    userMiddleware.verifyUser,
    userWishlist.moveToCart
);
userRouter.get(
    "/deleteFromWishlist",
    userMiddleware.verifyUser,
    userWishlist.deleteFromWishlist
);

//password change
userRouter.get("/forgot_password", userPassword.getForgotPassword);
userRouter.post("/sendOTPRoute", userPassword.getResetPasswordOtp);
userRouter.post("/verifyOTPRoute", userPassword.verifyForgotPasswordOtp);
userRouter.get("/resetPassword/:phoneNumber", userPassword.getResetPassword);
userRouter.post("/changePassword", userPassword.changePassword);

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
