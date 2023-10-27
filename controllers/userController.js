require("dotenv").config();
const user = require("../model/userModel");
// const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const twilio_account_sid = process.env.twilio_account_sid;
const twilio_auth_token = process.env.twilio_auth_token;
const twilio_serviceId = process.env.twilio_serviceId;
const twilio = require("twilio")(twilio_account_sid, twilio_auth_token);
const product = require("../model/productModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.JWT_SECRET;
const cart = require("../model/cartModel");

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

const checkUserAuth = (req, res) => {
  res.status(200).send("You are authenticated!");
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
let userData;
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

let userEmail;
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
        res.render("page-login-register", {
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
            const products = await product.find();
            userEmail = verifyStatus.email;
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

const getSendOtp = async (req, res) => {
  try {
    console.log("reached the send otp fun.");
    phoneNumber = req.body.phoneNumber;
    userData = req.body;
    console.log(phoneNumber);
    console.log(userData);
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

    const otp = req.body.otpCode;
    console.log(otp);

    const verifyOTP = await twilio.verify.v2
      .services(twilio_serviceId)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      console.log("VERIFIED");
      await user.create({
        username: userData.username,
        password: userData.password,
        confirm_password: userData.confirm_password,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        status: "Unblocked",
        isVerified: 0,
      });
      // .then(()=>{
      // res.render("page-login-register", {
      //   verified: "The OTP verification is successfull.",
      // });
      res.redirect("/");
      // })
    } else {
      res.redirect("/page-signup", {
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

//getting cart
const getCart = async (req, res) => {
  try {
    const userData = await user.findOne({ email: req.user });
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId", // Specify the path to the product ID in the cart's products array
      model: "product", // Reference the 'product' model
    });
    // The 'userCart' now contains the populated 'products' array with product details
    // You can access these details in your template
    res.render("cart", { userCart });
  } catch (error) {
    console.error("Error while loading cart:", error);
    // Handle the error as needed
  }
};

//function for adding product to cart
const addToCartController = async (req, res) => {
  try {
    // Extract user ID and product ID from the request
    const { productId } = req.body;
    let userData = await user.findOne({ email: req.user });
    let userId = userData._id;
    // Check if the user has a cart document
    let userCart = await cart.findOne({ userId: userId });
    // If the user doesn't have a cart, create a new one
    if (!userCart) {
      userCart = new cart({
        userId: userId,
        products: [],
      });
    }
    // Check if the desired product is already in the cart
    const existingProduct = userCart.products.find(
      (product) => product.productId.toString() === productId
    );
    if (existingProduct) {
      // If the product is in the cart, increase its quantity
      console.log("The product is already inside the cart.");
    } else {
      // If the product is not in the cart, add it with a quantity of 1
      userCart.products.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity: 1,
      });
    }
    // Save the updated cart document
    await userCart.save();
    res.json({ message: "Product added to the cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    // res.status(500).json({ error: "Failed to add the product to the cart" });
  }
};

const postCartQty = async (req, res) => {
  try {
    const userData = await user.findOne({ email: req.user });
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId",
      model: "product",
    });
    if (!userCart) {
      return res.status(404).json({ error: "User cart not found" });
    }
    const productId = req.body.productId;
    const action = req.body.action;
    const productInCart = userCart.products.find(
      (product) => product._id.toString() === productId
    );

    if (!productInCart) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }

    if (action === "increase") {
      productInCart.quantity += 1;
    } else if (action === "decrease") {
      if (productInCart.quantity > 1) {
        productInCart.quantity -= 1;
      }
    } else {
      return res.status(400).json({ error: "Invalid action provided" });
    }

    await userCart.save();

    // Calculate the updatedSubtotal as a number
    const updatedSubtotal = Number(productInCart.productId.selling_price) * productInCart.quantity;

    // Create a response object with the updated quantity and subtotal
    const response = {
      updatedQuantity: productInCart.quantity,
      updatedSubtotal,
    };

    return res.json(response);
  } catch (error) {
    console.log("An error occurred while modifying quantity: " + error);
    return res
      .status(500)
      .json({ error: "An error occurred while modifying quantity" });
  }
};

// Controller function to remove a product from the cart
const removeProductFromCart = async (req, res) => {
  try {
    const userData = await user.findOne({ email: req.user });
    const userCart = await cart.findOne({ userId: userData._id });
    // Extract the product ID from the request parameters
    const productId = req.params.productId;
    if (!userCart) {
      return res.status(404).json({ error: "User cart not found" });
    }
    // Find the product in the user's cart by its ID
    const productIndex = userCart.products.findIndex(
      (product) => product._id.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }
    // Remove the product from the user's cart
    userCart.products.splice(productIndex, 1);
    // Save the updated cart
    await userCart.save();
    res.sendStatus(200); // Send a success status code
  } catch (error) {
    console.error("Error removing the product from the cart: " + error);
    res.sendStatus(500); // Send a server error status code
  }
};

//exporting functions
module.exports = {
  findProduct,
  testmid,
  getVerifyOtp,
  getSendOtp,
  getUserHomePage,
  checkUserAuth,
  postUserSignup,
  getUserRoute,
  getUserSignup,
  getHomePage,
  logout,
  getCart,
  addToCartController,
  postCartQty,
  removeProductFromCart,
};

// const category=require("../model/categoryModel")
// const admin = require("../model/adminModel");

// module.exports.getAdminLogin = (req, res) => {
//   res.render("admin-login-page");
// };

// //chechking deatils aand login admin
// module.exports.postAdminDashboard = async (req, res) => {
//   const admindata = await admin.findOne({ email: req.body.email });
//   if (!admindata) {
//     res.render("admin-login-page", { error: "This email is not registered" });
//   } else {
//     if (admindata) {
//       if (req.body.email !== admindata.email) {
//         res.render("admin-login-page", { error: "Incorrect email" });
//       } else if (req.body.password !== admindata.password) {
//         res.render("admin-login-page", { error: "Incorrect password" });
//       } else {
//         if (
//           req.body.email == admindata.email &&
//           req.body.password == admindata.password
//         ) {
//           res.render("admin-dashboard");
//         }
//       }
//     } else {
//       res.redirect("/admin-login-page");
//     }
//   }
// };

// //get users list
// module.exports.getUsers = async (req, res) => {
//   try {
//     const users = await user.find();
//     res.render("users-list", { users });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error retrieving user data");
//   }
// };

// //getting the product list
// module.exports.getProductsList = async (req, res) => {
//   try {
//     const products = await product.find({});
//     res.render("admin-products-list", { products });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error retrieving user data");
//   }
// };

// // get add product
// module.exports.getAddProduct = (req, res) => {
//   res.render("admin-add-product");
// };
// //post the added product
// module.exports.postAddProduct = (req, res) => {
//   const {
//     name,
//     description,
//     regular_price,
//     selling_price,
//     category,
//     brand,
//     stock,
//     status,
//   } = req.body;

//   const photos = req.files;
//   let arr = [];
//   photos.forEach((element) => {
//     arr.push({ name: element.filename, path: element.path });
//   });

//   if (
//     !name ||
//     !description ||
//     !regular_price ||
//     !category ||
//     !brand ||
//     !stock ||
//     !status ||
//     !photos
//   ) {
//     return res.redirect("/admin-products-list",{
//       error:
//         "Please fill out all the required fields and upload at least one photo.",
//     });
//   }

//   const photoIds = arr.map((photo) => photo.path);

//   const newProduct = new product({
//     name,
//     description,
//     regular_price,
//     selling_price,
//     category,
//     brand,
//     stock,
//     status,
//     photos: photoIds,
//   });

//   newProduct.save();
//   res.redirect("/admin-products-list");
// };

// module.exports.postUserStatus = async (req, res) => {
//   const userId = req.params.userId;
//   const newStatus = req.body.status;

//   try {
//     const updatedUser = await user.findByIdAndUpdate(userId, {
//       status: newStatus,
//     });

//     res.status(200).json({ status: updatedUser.status });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error updating user status.");
//   }
// };

// module.exports.postProductStatus =async(req,res)=>{
//   const productId =req.params.productId;
//   const newStatus=req.body.status
//   try{
//     const updateProduct =await product.findByIdAndUpdate(productId,{
//      status:newStatus
//     });
//     res.status(200).json({status:updateProduct.status});
//   }catch(error){
//     console.error(error);
//     res.status(500).send("Error updating Product status")
//   }
// };
// //geting edit product
// module.exports.getEditProduct = async (req, res) => {
//   try {
//     const editId = req.query.productId;

//     console.log(editId)
//     // Fetch the product details based on the productId
//     const editProduct = await product.findById(editId);

//     // console.log(products)

//     if (!editProduct) {
//       // Handle the case when the product is not found
//       return res.send("Product not found");
//     }

//     // Render the "product-page" template and pass the product details
//     res.render("admin-prdouct-edit-page", { editProduct });
//   } catch (error) {
//     console.error(error);
//     res.send("Error fetching product details");
//   }
// };

// //saving edited details into the db
// module.exports.postEditProduct = async (req, res) => {
//   try {
//     const editId = req.params.productId;
//     const existingProduct = await product.findById(editId);

//     const {
//       name,
//       description,
//       regular_price,
//       selling_price,
//       category,
//       brand,
//       stock,
//     } = req.body;

//     // Get newly uploaded photos
//     const photos = req.files;
//     const newPhotos = photos.map((element) => ({ name: element.filename, path: element.path }));
//     const picPaths=newPhotos.map((photo) => photo.path);
//     // Include old photos that weren't edited
//     const updatedPhotos = existingProduct.photos.map((oldPhoto, index) =>
//     picPaths[index] ? picPaths[index] : oldPhoto
//     );
//     const updatedData = {
//       name,
//       description,
//       regular_price,
//       selling_price,
//       category,
//       brand,
//       stock,
//       status: existingProduct.status,
//       photos: updatedPhotos,
//     };

//     const updatedProduct = await product.findByIdAndUpdate(editId, updatedData, { new: true });
//     const successMessage = "Product updated successfully";
//     console.log(updatedProduct);
//     res.redirect('/admin-products-list');
//   } catch (error) {
//     console.log(error);
//     res.render("admin-product-edit-page", { error: "An error occurred while updating the product, please try again" });
//   }
// };

// // Assuming you fetch the categories from your database
// module.exports.getCategories = async (req, res) => {
//   try {
//     const categories = await category.find(); // Replace with your actual Category model
//     console.log(categories)

//     res.render('admin-category-management', { categories });

//   } catch (error) {
//     // Handle the error
//     console.error(error);
//     res.render('admin-dashboard'); // Render an error page
//   }
// };

// module.exports.postAddCategory =async (req, res) => {
//   try {
//       // Retrieve category data from the request body
//       const { name, description, status } = req.body;

//       // Get the path of the uploaded image
//       const imagePath = req.file.path;

//       // Create a new category using the Category model
//       const newCategory = new category({
//           name,
//           description,
//           icon: imagePath, // Store the image path in the "icon" field
//           status,
//       });

//       // Save the new category to the database
//       await newCategory.save();

//       // Redirect to a success page or wherever you want
//       res.redirect('/admin-category-management'); // Change this URL as needed
//   } catch (error) {
//       // Handle any errors that occur during category creation
//       console.error(error);
//       // Redirect to an error page or show an error message
//       res.render('admin-category-management'); // Change this URL as needed
//   }
// };
