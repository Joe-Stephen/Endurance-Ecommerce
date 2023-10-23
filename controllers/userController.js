require("dotenv").config();
const user = require("../model/userModel");
// const nodemailer = require("nodemailer");
const twilio_account_sid = process.env.twilio_account_sid;
const twilio_auth_token = process.env.twilio_auth_token;
const twilio_serviceId = process.env.twilio_serviceId;
const twilio = require("twilio")(twilio_account_sid, twilio_auth_token);
const product = require("../model/productModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.JWT_SECRET;

console.log(secretKey);
//getting user home page
const getHomePage = async (req, res) => {
  try {
    const products = await product.find();
    // console.log(products)
    res.render("index-4", { products: products });
  } catch (error) {
    console.error(error);
    res.send("Error fetching products");
  }
};

const logout = (req, res) => {
  // console.log(req.user)
  // console.log(req.cookies.token)
  res.clearCookie("token");
  res.redirect("/loginPage");
};

let isOtpVerified = false;

//code for email sending and verification

// const sendVerifyMail = async (name, email, user_id) => {
//   try {
//     console.log(
//       "The verification mail has been send, please check your inbox for the same."
//     );
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       requireTLS: true,
//       auth: {
//         user: "joestephenk10@gmail.com",
//         pass: "pqch fcmn ruxe hhyt",
//       },
//     });
//     const mailOptions = {
//       from: "joestephenk10@gmail.com",
//       to: email,
//       subject: "Account verification mail",
//       html:
//         "<p>Hello " +
//         name +
//         ', please click here to <a href="http://127.0.0.1:3000/verify-email?id=' +
//         user_id +
//         '"> Verify </a> your mail.</p>',
//     };
//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log("Email has been sent: ", info.response);
//       }
//       console.log("hia");
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// const verifyEmail = async (req, res) => {
//   try {
//     const updateInfo = await user.updateOne(
//       { _id: req.query.id },
//       { $set: { isVerified: 1 } }
//     );
//     console.log(updateInfo);
//     res.render("page-login-register", {
//       verified: "Your email has been verified, please login.",
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

//getting home page

//getting user login page
const getUserRoute = (req, res) => {
  res.render("page-login-register");
};

//getting user signup page
const getUserSignup = (req, res) => {
  res.render("page-signup");
};

//posting user details to the database
const postUserSignup = async (req, res) => {
  const formData = await user.findOne({
    email: req.body.email,
  });
  if (formData) {
    res.redirect("/page-signup", {
      error: "User with this email Already exists! Try with another email.",
    });
  } else {
    console.log("kittyaa?");
    res.render("otpVerificationPage");
    // const userData = await user.findOne({
    //   username: req.body.username,
    //   email: req.body.email,
    // });
    // if (userData) {
    //   sendVerifyMail(req.body.username, req.body.email, userData._id);
    // }
    // console.log("hai");

    // , {
    //   subreddit:
    //     "The verification mail has been send, please check your inbox for the same.",
    // });
  }
};

//authenticating user credentials
const getUserHomePage = async (req, res) => {
  const verifyStatus = await user.findOne({
    email: req.body.email,
  });
  if (!verifyStatus) {
    res.render("page-login-register", {
      subreddit: "This email is not registered!",
    });
  } else {
    if (verifyStatus) {
      if (verifyStatus.status == "Blocked") {
        res.redirect("page-login-register", {
          subreddit: "Your account is currently blocked!",
        });
      } else if (req.body.password !== verifyStatus.password) {
        res.redirect("page-login-register", {
          subreddit: "Incorrect password!",
        });
      } else {
        if (
          req.body.email === verifyStatus.email &&
          req.body.password === verifyStatus.password
        ) {
          try {
            email = req.body.email;
            const token = jwt.sign(email, secretKey);
            res.cookie("token", token);
            console.log("joe");
            console.log(req.cookies);
            const products = await product.find();
            res.render("index-4", {
              products: products,
              message: "User Logged in Successfully",
            });
          } catch (error) {
            console.error(error);
            // res.send('Error fetching products');
          }
        }
      }
    } else {
      console.log("hallooo");
      res.redirect("/");
    }
  }
};
let phoneNumber;
let userData;
const getSendOtp = async (req, res) => {
  try {
    phoneNumber = req.query.phoneNumber;
    userData=req.body;
    console.log(phoneNumber);
    await twilio.verify.v2.services(twilio_serviceId).verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    });
    res.json({ data: "hi" });
  } catch (err) {
    console.error(err);
  }
};

const getVerifyOtp = async (req, res) => {
  try {
    console.log(userData);
    console.log(phoneNumber);

    console.log("joeeee");
    const otp = req.body.otpCode;
    console.log(otp);

    const verifyOTP = await twilio.verify.v2
      .services(twilio_serviceId)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      await user.create({
        username: userData.username,
        password: userData.password,
        confirm_password: userData.confirm_password,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        status: "Unblocked",
        isVerified: 0,
      });
      res.render("page-login", {
        verified: "The OTP verification is successfull.",
      });
    } else {
      res.redirect("page-signup", {
        error: "Incorrect O.T.P",
      });
    }
  } catch (err) {
    console.error(err);
  }
};

//getting product page
(req, res) => {
  res.render("product-page");
};

// for testing purpose only
const testmid = (req, res) => {
  res.render("mail-verification-login");
};

const findProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    // Fetch the product details based on the productId
    const products = await product.findById(productId);
    // console.log(products)

    if (!products) {
      // Handle the case when the product is not found
      return res.send("Product not found");
    }

    // Render the "product-page" template and pass the product details
    res.render("product-page", { products });
  } catch (error) {
    console.error(error);
    res.send("Error fetching product details");
  }
};
module.exports = {
  findProduct,
  testmid,
  getVerifyOtp,
  getSendOtp,
  getUserHomePage,
  postUserSignup,
  getUserRoute,
  getUserSignup,
  getHomePage,
  logout
};

//route handlers for admin-side















const category=require("../model/categoryModel")
const admin = require("../model/adminModel");

module.exports.getAdminLogin = (req, res) => {
  res.render("admin-login-page");
};

//chechking deatils aand login admin
module.exports.getAdminDashboard = async (req, res) => {
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
//geting edit product
module.exports.getEditProduct = async (req, res) => {
  try {
    const editId = req.query.productId;

    console.log(editId)
    // Fetch the product details based on the productId
    const editProduct = await product.findById(editId);

    // console.log(products)

    if (!editProduct) {
      // Handle the case when the product is not found
      return res.send("Product not found");
    }

    // Render the "product-page" template and pass the product details
    res.render("admin-prdouct-edit-page", { editProduct });
  } catch (error) {
    console.error(error);
    res.send("Error fetching product details");
  }
};

//saving edited details into the db
module.exports.postEditProduct = async (req, res) => {
  try{
  const editId = req.params.productId;
  const updatedData=req.body
  console.log(editId)
  const updatedProduct = await product.findByIdAndUpdate(editId, updatedData, { new: true });

  console.log(updatedData)
  res.redirect('/admin-products-list');
  }catch(error){
    console.log(error)
    res.render("admin-prdouct-edit-page",{error:"An error occured while updating the product, please try again"});
  }



  // const photos = req.files;
  // let arr = [];
  // photos.forEach((element) => {
  //   arr.push({ name: element.filename, path: element.path });
  // });



}

//function for getting category management
module.exports.getCategoryList = async (req, res) => {
 
    // Fetch the product details based on categories
    const categories= await category.find()
        res.render('admin-category-management', { categories });
      };
  


  




