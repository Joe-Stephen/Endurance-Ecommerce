// const express = require("express");
// const app = express();
// const adminRouter = express.Router();
// // const adminRouter = express.Router();
// const userController = require("../controllers/userController");

// const adminController = require("../controllers/adminController");

// adminRouter.use(express.static("public/adminAssets/assets"));
// const multer = require("multer");
// const path = require("path");
// const cookieParser = require('cookie-parser')


// adminRouter.use("/uploads",express.static('uploads'));
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

// adminRouter.get("", userController.getAdminLogin);
// adminRouter.get("/admin-dashboard",userController.getAdminDashboard);
// adminRouter.post("/admin-dashboard", userController.getAdminDashboard);
// adminRouter.get("/admin-user-management", userController.getUsers);
// adminRouter.get("/admin-products-list", userController.getProductsList);
// adminRouter.get("/admin-add-product", userController.getAddProduct);
// adminRouter.post("/add-product",upload.array("photo"), userController.postAddProduct);
// adminRouter.post("/update-user-status/:userId", userController.postUserStatus);
// adminRouter.post("/product/:productId",userController.postProductStatus)

// module.exports = adminRouter;