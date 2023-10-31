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

//login
adminRouter.get("/", adminController.getAdminLogin);
adminRouter.post("/admin-dashboard", adminController.postAdminDashboard);

//user management
adminRouter.get("/admin-user-management", adminController.getUsers);
adminRouter.post("/update-user-status/:userId", adminController.postUserStatus);
adminRouter.get("/admin-products-list", adminController.getProductsList);
adminRouter.get("/admin-add-product", adminController.getAddProduct);
adminRouter.post("/add-product",upload.array("photo"), adminController.postAddProduct);
adminRouter.post("/product/:productId",adminController.postProductStatus);
adminRouter.get("/edit-product",adminController.getEditProduct);
adminRouter.post("/post-edit-product/:productId",upload.array("photo"),adminController.postEditProduct);

//category management
adminRouter.get("/admin-category-management",adminController.getCategories);
adminRouter.post("/add-category", adminController.postAddCategory);
adminRouter.get("/edit-category/:categoryId", adminController.editCategory);
adminRouter.post("/edit-category",upload.single("icon"), adminController.postEditCategory);
adminRouter.delete("/delete-category/:categoryId", adminController.deleteCategory);

//order management
adminRouter.get("/orderList", adminController.getOrderList);
adminRouter.get("/editOrder/:orderId", adminController.getOrderDetails);
adminRouter.post("/editOrderStatus", adminController.editOrderStatus);


module.exports = adminRouter;