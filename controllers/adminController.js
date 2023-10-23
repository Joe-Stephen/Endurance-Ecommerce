const admin = require("../model/adminModel");
const product = require("../model/productModel");
const user = require("../model/userModel");
const multer = require("multer");

module.exports.getAdminLogin = (req, res) => {
  res.render("admin-login-page");
};

//chechking deatils aand login admin
module.exports.getAdminDashboard = async (req, res) => {
  const admindata = await admin.findOne({ email: req.body.email });
  if (!admindata) {
    res.render("admin-login-page", { subreddit: "This email is not registered" });
  } else {
    if (admindata) {
      if (req.body.email !== admindata.email) {
        res.render("admin-login-page", { subreddit: "Incorrect email" });
      } else if (req.body.password !== admindata.password) {
        res.render("admin-login-page", { subreddit: "Incorrect password" });
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
    res.render("users-list", { users });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving user data");
  }
};

//getting the product list
module.exports.getProductsList = async (req, res) => {
  try {
    const products = await product.find({});
    res.render("admin-products-list", { products });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving user data");
  }
};

// get add product
module.exports.getAddProduct = (req, res) => {
  res.render("admin-add-product");
};
//post the added product
module.exports.postAddProduct = (req, res) => {
  const {
    name,
    description,
    regular_price,
    selling_price,
    category,
    brand,
    stock,
    status,
  } = req.body;

  const photos = req.files;
  let arr = [];
  photos.forEach((element) => {
    arr.push({ name: element.filename, path: element.path });
  });

  if (
    !name ||
    !description ||
    !regular_price ||
    !category ||
    !brand ||
    !stock ||
    !status ||
    !photos
  ) {
    return res.render("admin-products-list", {
      error:
        "Please fill out all the required fields and upload at least one photo.",
    });
  }

  const photoIds = arr.map((photo) => photo.path);

  const newProduct = new product({
    name,
    description,
    regular_price,
    s_price,
    category,
    brand,
    stock,
    status,
    photos: photoIds,
  });

  newProduct.save();
  res.redirect("/admin/admin-products-list");
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
    res.status(500).send("Error updating user status.");
  }
};

module.exports.postProductStatus =async(req,res)=>{
  const productId =req.params.productId;
  const newStatus=req.body.status
  try{
    const updateProduct =await product.findByIdAndUpdate(productId,{
     status:newStatus 
    });
    res.status(200).json({status:updateProduct.status});
  }catch(error){
    console.error(error);
    res.status(500).send("Error updating Product status")
  }
};