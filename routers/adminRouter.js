const express = require("express");
const adminRouter = express.Router();
// const adminRouter = express.Router();
const adminController = require("../controllers/adminController");
const multer = require("multer");
const path = require("path");
// const cookieParser = require('cookie-parser')


adminRouter.use(express.static("public/adminAssets/assets"));
adminRouter.use("/uploads",express.static('uploads'));
// adminRouter.use(cookieParser())
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload=multer({storage:storage})

console.log("ADMIN ROUTER CALLED")

adminRouter.get("/", adminController.getAdminLogin);
// adminRouter.get("/admin-dashboard",adminController.getAdminDashboard);
adminRouter.post("/admin-dashboard", adminController.postAdminDashboard);
adminRouter.get("/admin-user-management", adminController.getUsers);
adminRouter.get("/admin-products-list", adminController.getProductsList);
adminRouter.get("/admin-add-product", adminController.getAddProduct);
adminRouter.post("/add-product",upload.array("photo"), adminController.postAddProduct);
adminRouter.post("/update-user-status/:userId", adminController.postUserStatus);
adminRouter.post("/product/:productId",adminController.postProductStatus);
adminRouter.get("/edit-product",adminController.getEditProduct);
adminRouter.post("/post-edit-product/:productId",upload.array("photo"),adminController.postEditProduct);
adminRouter.get("/admin-category-management",adminController.getCategories);
adminRouter.post("/add-category",upload.single("icon"),adminController.postAddCategory);

module.exports = adminRouter;