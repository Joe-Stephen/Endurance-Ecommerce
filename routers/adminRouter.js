const express = require("express");
const adminRouter = express.Router();
// const adminRouter = express.Router();
const adminController = require("../controllers/adminController");
const productManagement = require("../controllers/productManagement");
const multer = require("multer");
const multerMiddleware = require("../middlewares/admin/multerMiddleware");

const path = require("path");
// const cookieParser = require('cookie-parser')


adminRouter.use(express.static("public/adminAssets/assets"));

adminRouter.use("/uploads",express.static('uploads'));


//error page
adminRouter.get("/errorPage", adminController.getErrorPage);

//login
adminRouter.get("/", adminController.getAdminLogin);
adminRouter.post("/admin-dashboard", adminController.postAdminDashboard);

//user management
adminRouter.get("/admin-user-management", adminController.getUsers);
adminRouter.post("/update-user-status/:userId", adminController.postUserStatus);

//product management
adminRouter.get("/admin-products-list", productManagement.getProductsList);
adminRouter.get("/admin-add-product", productManagement.getAddProduct);
adminRouter.post("/add-product",multerMiddleware.array("photo"), productManagement.postAddProduct);
adminRouter.post("/product/:productId",productManagement.postProductStatus);
adminRouter.get("/edit-product",productManagement.getEditProduct);
adminRouter.post("/post-edit-product/:productId",multerMiddleware.array("photo"),productManagement.postEditProduct);
adminRouter.delete("/delete-product/:productId",productManagement.deleteProduct);

//category management
adminRouter.get("/admin-category-management",adminController.getCategories);
adminRouter.post("/add-category", adminController.postAddCategory);
adminRouter.get("/edit-category/:categoryId", adminController.editCategory);
adminRouter.post("/edit-category",multerMiddleware.single("icon"), adminController.postEditCategory);
adminRouter.delete("/delete-category/:categoryId", adminController.deleteCategory);

//coupon management 
adminRouter.get("/couponManagement", adminController.getCouponManagement);
adminRouter.get("/adminAddCoupon", adminController.getAddCoupon);
adminRouter.get("/getEditCoupon", adminController.getEditCoupon);
adminRouter.post("/saveEditedCoupon", adminController.saveEditedCoupon);
adminRouter.post("/saveCoupon", adminController.saveCoupon);
adminRouter.post("/update-coupon-status/:couponId", adminController.toggleCouponStatus);


//order management
adminRouter.get("/orderList", adminController.getOrderList);
adminRouter.get("/editOrder/:orderId", adminController.getOrderDetails);
adminRouter.post("/editOrderStatus", adminController.editOrderStatus);

module.exports = adminRouter;