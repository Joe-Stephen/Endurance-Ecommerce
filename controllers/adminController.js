const admin = require("../model/adminModel");
const coupon = require("../model/couponModel")
const category=require("../model/categoryModel")
const product = require("../model/productModel");
const order  = require("../model/orderModel")
const user = require("../model/userModel");
const multer = require("multer");

//error page loading
module.exports.getErrorPage = (req, res) => {
  try {
    res.render("error-page");
  } catch (err) {
    console.error("An error happened while loading the error page! :" + err);
    res.status(500).render("error-page", { message: "An error happened while loading the error page!", errorMessage: err.message });
  }
};


module.exports.getAdminLogin = (req, res) => {
  res.render("admin-login-page");
};

//chechking deatils and login admin
module.exports.postAdminDashboard = async (req, res) => {
  const admindata = await admin.findOne({ email: req.body.email });
  if (!admindata) {
    res.render("admin-login-page", { error: "This email is not registered" });
  } else {
    if (admindata) {
      if (req.body.email !== admindata.email) {
        res.render("admin-login-page", { error: "Incorrect email" });
      } else if (req.body.password !== admindata.password) {
        res.render("admin-login-page", { error: "Incorrect password" });
      } else {
        if (
          req.body.email == admindata.email &&
          req.body.password == admindata.password
        ) {
          res.render("admin-dashboard");
        }
      }
    } else {
      res.redirect("/admin-login-page");
    }
  }
};

//get users list
module.exports.getUsers = async (req, res) => {
  try {
    const users = await user.find();
    res.render("admin-user-management", { users });
  } catch (error) {
    console.log(error);
    res.status(500).render("error-page", { message: "Error retrieving user data!", errorMessage: err.message });

  }
};









module.exports.postUserStatus = async (req, res) => {
  const userId = req.params.userId;
  const newStatus = req.body.status;

  try {
    const updatedUser = await user.findByIdAndUpdate(userId, {
      status: newStatus,
    });

    res.status(200).json({ status: updatedUser.status });
  } catch (error) {
    console.error(error);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
};


  //toggle coupon status
  module.exports.toggleCouponStatus = async (req, res) => {
    try {
    const couponId = req.params.couponId;
    console.log("id----"+couponId);
    const newStatus = req.body.status;
    console.log("status----"+newStatus);
    const UpdatedCoupon = await coupon.findByIdAndUpdate(couponId, { isActive:newStatus });
    res.status(200).json({ status: UpdatedCoupon.isActive });    }
    catch (error) {
      console.error(error);
      res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
  };







// Assuming you fetch the categories from your database
module.exports.getCategories = async (req, res) => {
  try {
    const categories = await category.find(); // Replace with your actual Category model
    console.log(categories)

    res.render('admin-category-management', { categories });

  } catch (error) {
    // Handle the error
    console.error(error);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
};

  

module.exports.postAddCategory = async (req, res) => {
  try {
      // Retrieve category data from the request body
      const { name, description } = req.body;
      
      // Create a new category using the Category model
      const newCategory = new category({
          name,
          description,
      });

      // Save the new category to the database
      await newCategory.save();

      // Redirect to a success page
      res.redirect('/admin/admin-category-management'); // Change this URL as needed
  } catch (error) {
      // Handle any errors that occur during category creation
      console.error("An error occurred while adding the category: " + error);

      // Redirect to an error page or show an error message
      res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
};


//edit category
module.exports.editCategory= async (req, res)=>{
  try{
  const categoryDetails= await category.findById(req.params.categoryId);
  res.render("admin-category-edit", {categoryDetails});
  }
  catch(err){
    console.log("An error happened while getting edit category! :"+err);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
}

// Post edit category
module.exports.postEditCategory = async (req, res) => {
  try {
      const categoryId = req.body.categoryId; // Get the category ID from the form
      const { name, description } = req.body;
      let updatedData = {
          name,
          description,
      };

      await category.findByIdAndUpdate(categoryId, updatedData, { new: true });
      const successMessage = 'Category updated successfully';

      res.redirect('/admin/admin-category-management');
  } catch (error) {
      console.log('An error has occurred while editing the category: ' + error);
      res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
    }
};

// Deleting category
module.exports.deleteCategory = async (req, res) => {
  try {
    await category.deleteOne({ _id: req.params.categoryId });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log("An error happened while deleting the category:" + error);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
}

//coupon management
//get coupon management
module.exports.getCouponManagement= async (req, res)=>{
  try{
    const couponList= await coupon.find();
    res.render("admin-coupon-management", {couponList});
  }
  catch(err){
    console.log("An error happened while loading the coupon page! :"+err);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
};

//get add coupon
module.exports.getAddCoupon = async (req, res)=>{
  try{
    res.render("adminAddCoupon")
  }
  catch(err){
    console.log("An error happened while loading the add-coupon page! :"+err);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
};

//edit coupon
module.exports.getEditCoupon= async (req, res)=>{
  try{
    const couponDoc= await coupon.findById(req.query.couponId)
    res.render("adminEditCoupon", {couponDoc});
  }
  catch(err){
    console.log("An error occured while loading the edit coupon page! : "+err);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
};

//saving edited coupon
module.exports.saveEditedCoupon = async (req, res) => {
  try {
    const couponCode = req.body.code;
    const couponId = req.body.couponId;

    // Check if the coupon code is unique
    const existingCoupon = await coupon.findOne({ code: couponCode, _id: { $ne: couponId } });
    if (existingCoupon) {
      // The coupon code already exists for another coupon, so return an error
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    // Check if the expiration date is not in the past
    const expirationDate = new Date(req.body.expirationDate);
    if (expirationDate < new Date()) {
      return res.status(400).json({ error: 'Expiration date must be in the future' });
    }

    // Update the existing coupon document with the new data
    const updatedCoupon = await coupon.findByIdAndUpdate(
      couponId,
      {
        code: couponCode,
        discountType: req.body.discountType,
        discountValue: req.body.discountValue,
        minOrderAmount: req.body.minOrderAmount,
        expirationDate: expirationDate,
      },
      { new: true } // Return the updated document
    );

    if (!updatedCoupon) {
      // Coupon with the given ID not found
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // Return the updated coupon document
    res.json(updatedCoupon);
  } catch (error) {
    console.error("An error occurred while saving the edited coupons: " + error);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
};


//save coupon to db
module.exports.saveCoupon= async (req, res)=>{
  try{
    const couponCode = req.body.code;
    console.log("codeasdfsadf "+req.body.formData);
    const existingCoupon = await coupon.findOne({ code: couponCode });
    if (existingCoupon) {
      // The coupon code already exists, so return an error
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    const newCoupon = new coupon({
      code: couponCode,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue,
      minOrderAmount: req.body.minOrderAmount,
      maxRedeemableAmt: req.body.maxRedeemableAmount,
      expirationDate: req.body.expirationDate,
    });
    // Save the new coupon document
    await newCoupon.save();
    // Return the new coupon document
    return res.status(200).json(newCoupon);
  }
  catch(err){
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
};

//getting order list
module.exports.getOrderList = async (req, res) => {
  try {
    const orderList = await order.find().sort({orderDate:-1});
    // console.log("An error happened while loading order list!: "+orderList );
    let userData=[];

    // Loop through each order in orderList
    for (const orderItem of orderList) {
      const userId = orderItem.userId;
      console.log("uswer id: "+userId );

      let userDoc= await user.findById({ _id: userId });
      console.log("uswer doc: "+userDoc );
      userData.push(userDoc.username);

    }
    console.log("user data: "+userData );

    res.render("admin-order-management", { orderList, userData});
  } catch (error) {
    console.log("An error happened while loading order list!:" + error);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
};
//getting order details and edit
module.exports.getOrderDetails= async (req, res)=>{
  try{
      const orderDetails= await order.findById({_id:req.params.orderId}).populate({
      path: "products.productId",
      model: "product",
    });
    const userId=orderDetails.userId;
    const userData=await user.findById(userId);
    res.render("admin-order-edit", {orderDetails, userData});
  }
  catch(err){
    console.log("An error happened while accessing order details! :"+err);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
}

//editing order status
module.exports.editOrderStatus= async(req, res) =>{
  try{
    await order.updateOne({_id:req.body.orderId}, {$set:{orderStatus:req.body.orderStatus}});
    res.redirect("/admin/orderList");
  }
  catch(err){
    console.log("An error happened while editing the order status! :"+err);
    res.status(500).render("error-page", { message: "An error happened !", errorMessage: err.message });
  }
}       