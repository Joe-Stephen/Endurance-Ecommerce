const express = require("express");
const adminRouter = express.Router();
const userRouter = express.Router();
const userController = require("../controllers/userController");
const product = require("../model/productModel");
const jwt = require("jsonwebtoken");
const userMiddleware = require("../middlewares/user/userAuthentication");
const cookieParser = require("cookie-parser");
userRouter.use(cookieParser());

userRouter.get("", userController.getHomePage);
userRouter.get("/logout", userMiddleware, userController.logout);
userRouter.get("/product/:productId", userController.findProduct);
userRouter.route("/loginPage").get(userController.getUserRoute);
//user signup page
userRouter.route("/page-signup").get(userController.getUserSignup);
//posting user signup details
userRouter.route("/toVerifyPage").get(userController.postUserSignup);
userRouter.get("/send_otp", userController.getSendOtp);
userRouter.post("/verifyOTPnow", userController.getVerifyOtp);
userRouter.post("/index-4", userController.getUserHomePage);
// test routes
userRouter.route("/test").get(userController.testmid);






// adminRouter.use(express.static("public/adminAssets/assets"));
const multer = require("multer");
const path = require("path");

adminRouter.use("/uploads",express.static('uploads'));
adminRouter.use(cookieParser)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload=multer({storage:storage})

userRouter.get("/admin", userController.getAdminLogin);
userRouter.get("/admin-dashboard",userController.getAdminDashboard);
userRouter.post("/admin-dashboard", userController.getAdminDashboard);
userRouter.get("/admin-user-management", userController.getUsers);
userRouter.get("/admin-products-list", userController.getProductsList);
userRouter.get("/admin-add-product", userController.getAddProduct);
userRouter.post("/add-product",upload.array("photo"), userController.postAddProduct);
userRouter.post("/update-user-status/:userId", userController.postUserStatus);
userRouter.post("/product/:productId",userController.postProductStatus);
userRouter.get("/edit-product",userController.getEditProduct);
userRouter.post("/post-edit-product/:productId",userController.postEditProduct);
userRouter.get("/admin-category-management",userController.getCategoryList);
// userRouter.post("/add-category",userController.postAddCCategory);




module.exports = userRouter;