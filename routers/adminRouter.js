const express = require("express");
const adminRouter = express.Router();
const adminController = require("../controllers/adminController");
const productManagement = require("../controllers/adminProductManagement");
const categoryManagement = require("../controllers/adminCategoryManagement");
const couponManagement = require("../controllers/adminCouponManagement");
const orderManagement = require("../controllers/adminOrderManagement");
const bannerManagement = require("../controllers/adminBannerManagement");
const discountManagement= require("../controllers/adminDiscountManagement");
const multerMiddleware = require("../middlewares/admin/multerMiddleware");

const multer = require("multer");
const jwt = require("jsonwebtoken");
const adminMiddleware = require("../middlewares/admin/adminAuthentication");
const cookieParser = require("cookie-parser");
adminRouter.use(cookieParser());
const path = require("path");
// const cookieParser = require('cookie-parser')

adminRouter.use(express.static("public/adminAssets/assets"));
adminRouter.use("/uploads", express.static("uploads"));

//error page
adminRouter.get("/errorPage", adminController.getErrorPage);

//login
adminRouter.get("/", adminController.getAdminLogin);
adminRouter.get("/getAdminDashboard", adminMiddleware.verifyAdmin, adminController.getAdminDashboard);
adminRouter.post("/admin-dashboard", adminController.postAdminDashboard);
adminRouter.get("/adminLogout", adminController.getAdminLogout);

//user management
adminRouter.get("/admin-user-management", adminMiddleware.verifyAdmin, adminController.getUsers);
adminRouter.post("/update-user-status/:userId", adminMiddleware.verifyAdmin, adminController.postUserStatus);

//product management
adminRouter.get("/admin-products-list", adminMiddleware.verifyAdmin, productManagement.getProductsList);
adminRouter.get("/admin-add-product", adminMiddleware.verifyAdmin, productManagement.getAddProduct);
adminRouter.post("/add-product", adminMiddleware.verifyAdmin, multerMiddleware.array("photo"), productManagement.postAddProduct);
adminRouter.post("/product/:productId", adminMiddleware.verifyAdmin, productManagement.postProductStatus);
adminRouter.get("/edit-product", adminMiddleware.verifyAdmin, productManagement.getEditProduct);
adminRouter.delete('/deletePhoto/:productId', adminMiddleware.verifyAdmin, productManagement.deleteProductPhoto);
adminRouter.post("/post-edit-product/:productId", adminMiddleware.verifyAdmin, multerMiddleware.array("photo"), productManagement.postEditProduct);
adminRouter.delete("/delete-product/:productId", adminMiddleware.verifyAdmin, productManagement.deleteProduct);

//category management
adminRouter.get("/admin-category-management", adminMiddleware.verifyAdmin, categoryManagement.getCategories);
adminRouter.post("/add-category", adminMiddleware.verifyAdmin, categoryManagement.postAddCategory);
adminRouter.get("/edit-category/:categoryId", adminMiddleware.verifyAdmin, categoryManagement.editCategory);
adminRouter.post("/edit-category", adminMiddleware.verifyAdmin, multerMiddleware.single("icon"), categoryManagement.postEditCategory);
adminRouter.delete("/delete-category/:categoryId", adminMiddleware.verifyAdmin, categoryManagement.deleteCategory);

//coupon management
adminRouter.get("/couponManagement", adminMiddleware.verifyAdmin, couponManagement.getCouponManagement);
adminRouter.get("/adminAddCoupon", adminMiddleware.verifyAdmin, couponManagement.getAddCoupon);
adminRouter.get("/getEditCoupon", adminMiddleware.verifyAdmin, couponManagement.getEditCoupon);
adminRouter.post("/saveCoupon", adminMiddleware.verifyAdmin, couponManagement.saveCoupon);
adminRouter.post("/saveEditedCoupon", adminMiddleware.verifyAdmin, couponManagement.saveEditedCoupon);
adminRouter.post("/update-coupon-status/:couponId", adminMiddleware.verifyAdmin, couponManagement.toggleCouponStatus);

//order management
adminRouter.get("/orderList", adminMiddleware.verifyAdmin, orderManagement.getOrderList);
adminRouter.get("/editOrder/:orderId", adminMiddleware.verifyAdmin, orderManagement.getOrderDetails);
adminRouter.post("/editOrderStatus", adminMiddleware.verifyAdmin, orderManagement.editOrderStatus);

//transactions
adminRouter.get("/transactions", adminMiddleware.verifyAdmin, adminController.getTransactions);

//banner management
adminRouter.get("/bannerManagement", adminMiddleware.verifyAdmin, bannerManagement.getBannerManagement);
adminRouter.get("/admin-add-banner", adminMiddleware.verifyAdmin, bannerManagement.getAddBanner);
adminRouter.post("/add-Banner", adminMiddleware.verifyAdmin, multerMiddleware.single("file"), bannerManagement.postAddBanner);
adminRouter.get("/getEditBanner", adminMiddleware.verifyAdmin, bannerManagement.getEditBanner);
adminRouter.post("/saveEditedBanner", adminMiddleware.verifyAdmin, multerMiddleware.single("file"), bannerManagement.saveEditedBanner);
adminRouter.post("/update-banner-status/:bannerId", adminMiddleware.verifyAdmin, bannerManagement.toggleBannerStatus);

//discount management
adminRouter.get("/discountManagement", adminMiddleware.verifyAdmin, discountManagement.getDiscountManagement);
adminRouter.get("/getAddDiscount", adminMiddleware.verifyAdmin, discountManagement.getAddDiscount);
adminRouter.post("/postAddDiscount", adminMiddleware.verifyAdmin, discountManagement.postAddDiscount);
adminRouter.post("/update-discount-status/:discountId", adminMiddleware.verifyAdmin, discountManagement.toggleDiscountStatus);
adminRouter.get("/getEditDiscount", adminMiddleware.verifyAdmin, discountManagement.getEditDiscount);
adminRouter.post("/saveEditedDiscount", adminMiddleware.verifyAdmin, discountManagement.saveEditedDiscount);

// sales report
adminRouter.get("/salesReport/daily", adminMiddleware.verifyAdmin, adminController.getDailySalesReport);
adminRouter.get("/salesReport/weekly", adminMiddleware.verifyAdmin, adminController.getWeeklySalesReport);
adminRouter.get("/salesReport/monthly", adminMiddleware.verifyAdmin, adminController.getMonthlySalesReport);











module.exports = adminRouter;
