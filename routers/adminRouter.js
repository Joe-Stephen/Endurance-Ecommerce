const express = require("express");
const adminRouter = express.Router();
const adminController = require("../controllers/adminController");
const productManagement = require("../controllers/adminProductManagement");
const categoryManagement = require("../controllers/adminCategoryManagement");
const couponManagement = require("../controllers/adminCouponManagement");
const orderManagement = require("../controllers/adminOrderManagement");

const multer = require("multer");
const multerMiddleware = require("../middlewares/admin/multerMiddleware");

const path = require("path");
// const cookieParser = require('cookie-parser')

adminRouter.use(express.static("public/adminAssets/assets"));
adminRouter.use("/uploads", express.static("uploads"));

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
adminRouter.post("/add-product", multerMiddleware.array("photo"), productManagement.postAddProduct);
adminRouter.post("/product/:productId", productManagement.postProductStatus);
adminRouter.get("/edit-product", productManagement.getEditProduct);
adminRouter.post("/post-edit-product/:productId", multerMiddleware.array("photo"), productManagement.postEditProduct);
adminRouter.delete("/delete-product/:productId", productManagement.deleteProduct);

//category management
adminRouter.get("/admin-category-management", categoryManagement.getCategories);
adminRouter.post("/add-category", categoryManagement.postAddCategory);
adminRouter.get("/edit-category/:categoryId", categoryManagement.editCategory);
adminRouter.post("/edit-category", multerMiddleware.single("icon"), categoryManagement.postEditCategory);
adminRouter.delete("/delete-category/:categoryId", categoryManagement.deleteCategory);

//coupon management
adminRouter.get("/couponManagement", couponManagement.getCouponManagement);
adminRouter.get("/adminAddCoupon", couponManagement.getAddCoupon);
adminRouter.get("/getEditCoupon", couponManagement.getEditCoupon);
adminRouter.post("/saveEditedCoupon", couponManagement.saveEditedCoupon);
adminRouter.post("/saveCoupon", couponManagement.saveCoupon);
adminRouter.post("/update-coupon-status/:couponId", couponManagement.toggleCouponStatus);

//order management
adminRouter.get("/orderList", orderManagement.getOrderList);
adminRouter.get("/editOrder/:orderId", orderManagement.getOrderDetails);
adminRouter.post("/editOrderStatus", orderManagement.editOrderStatus);

//transactions
adminRouter.get("/transactions", adminController.getTransactions);



module.exports = adminRouter;
