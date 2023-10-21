const express=require('express');
const app=express();
const adminRouter=express.Router();
const adminController=require("../controllers/adminController");
const multer = require('multer');


adminRouter.use("/uploads",express.static('uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads'); // Define the destination folder where uploaded files will be stored.
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Use the original file name for the uploaded file.
    },
  });
  const upload=multer({storage:storage})




//route for admin login page
adminRouter.route('/admin-login-page')
.get(adminController.getAdminRoute);

//route for admin dashboard


adminRouter.route('/admin-dashboard')
.post(adminController.getAdminHomePage)
.get(adminController.getAdminHomePage)

adminRouter.route('/admin-user-management')
.get(adminController.getUserManagement)

adminRouter.route('/admin-products-list')
.get(adminController.getProducts)

adminRouter.route('/admin-add-product')
.get(adminController.getAddProduct)

// adminRouter.route('/submit-form')
// .get(adminController.processProductSubmission)

// adminRouter.route('/add-product')
// .post(adminController.postAddProduct)

// adminRouter.route('/add-product')
// .post(adminController.addProduct)


adminRouter.route('/submit-form')
.post(upload.array("photo"),adminController.addProduct)

//   adminRouter.post('/add-product', processProductSubmission);











module.exports = adminRouter;

