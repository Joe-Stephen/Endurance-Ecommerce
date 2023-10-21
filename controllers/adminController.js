const admin = require("../model/adminModel");
const product = require("../model/productModel");
const user = require("../model/userModel")

//getting admin login page
module.exports.getAdminRoute = (req, res) => {
    res.render("admin-login-page");
  };



//   module.exports.AdminHomePage = async(req, res) =>{
//     res.render("admin-dashboard");

// }


//getting admin dashboard
// module.exports.getAdminHomePage = async(req, res) =>{
//     const verifyStatus = await admin.findOne({
//         email: req.body.email
//       });
//       console.log(verifyStatus);
//       if (!verifyStatus) {
//         res.render("admin-login-page", {
//           subreddit: "This email is not registered!",
//         });
//       } else {
//         if (verifyStatus) {
//           if (req.body.email !== verifyStatus.email) {
//             res.render("admin-login-page", { subreddit: "Incorrect email!" });
//           } else if (req.body.password !== verifyStatus.password) {
//             res.render("admin-login-page", { subreddit: "Incorrect password!" });
//           } else {
//             if (
//               req.body.email === verifyStatus.email &&
//               req.body.password === verifyStatus.password
//             ) {
//               res.render("admin-dashboard");
//             }
//           }
//         } else {
//           res.redirect("admin-dashboard");
//         }
//       }
//     };

module.exports.getAdminHomePage = async (req,res)=>{
    const admindata = await admin.findOne({email:req.body.email});
    console.log(admindata)
    if(!admindata){
        console.log("heyy")
       res.render('admin-login-page',{subreddit:"This email is not registered"});
    }else{
    if(admindata){
        console.log("hii")
       if(req.body.email!== admindata.email){
           res.render('admin-login-page',{subreddit:"Incorrect Email"});
       }else if(req.body.password !== admindata.password){
           res.render('admin-login-page',{subreddit:"Incorrect Password"});
       }else{
           if(req.body.email == admindata.email && req.body.password == admindata.password){
               res.render("admin-dashboard")
           }
       }
    }else{
       res.redirect("/admin-login");
    } 
   } 
};


//getting user management
module.exports.getUserManagement = async (req, res) => {
    try {
        const users = await user.find(); // Assuming user is your Mongoose model for users
        res.render("admin-user-management", { users });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error retrieving user data");
    }
};

//getting product management
module.exports.getProductManagement = async (req, res) => {
    try{
        res.render("admin-products-list");
    }catch (error) {
        res.rendirect("admin-dashboard");
            console.log(error);
            res.status(500).send("Error retrieving user data");
        }
    // try {
    //     const users = await user.find(); // Assuming user is your Mongoose model for users
    //     res.render("admin-user-management", { users });
    // } catch (error) {
    //     console.log(error);
    //     res.status(500).send("Error retrieving user data");
    // }
};



//adding product page
module.exports.getAddProduct = async (req, res) => {
    try{
        res.render("admin-add-product");
    }catch (error) {
        res.rendirect("admin-products-list");
            console.log(error);
            res.status(500).send("Error retrieving user data");
        }
    };


//storing products to the product collection 
//posting user details to the database
// module.exports.postAddProduct = async (req, res) => {
//     const formData=req.body
//       if(formData)
//       {
//         await product.create({
//           name: req.body.name,
//           description: req.body.description,
//           regular_price: req.body.regular_price,
//           selling_price: req.body.selling_price,
//           status:"Active",
//           category: req.body.category,
//           brand: req.body.category,
//           stock: req.body.stock,
//         });
//         res.render("page-login-register");
//       }else{
//         res.render("page-signup",{
//           error: "Incorrect O.T.P",
//         });
//       }
//     };

    // module.exports.addProduct = (req, res) => {
    //     // Handle form data, including image file IDs from GridFS
    //     const { name, description, price, category, brand, stock, status } = req.body;
    //     const mainPhotoId = req.files['mainPhoto'][0].id;
    //     const photo2Id = req.files['photo2'][0].id;
    //     const photo3Id = req.files['photo3'][0].id;
    //     const photo4Id = req.files['photo4'][0].id;
    
        // Save the data and image IDs to your product model
        // For example, using Mongoose to create a new product document
    
    //     res.send('Product added successfully.');
    // };

//user status toggler function
// adminController.js

// Function to update user status
// module.exports.toggleUserStatus=async (userId, newStatus)=>{
//     try {
//         // Find the user by ID and update the status
//         console.log("hai")
//         await user.findByIdAndUpdate(userId, { status: newStatus });

//         return 'User status updated successfully.';
//     } catch (error) {
//         console.error(error);
//         throw 'Error updating user status.';
//     }
// }

module.exports.addProduct = (req, res) => {
    // Handle other form fields
    const { name, description, regular_price, selling_price, category, brand, stock, status } = req.body;
  
    // Handle uploaded photos
    const photos = req.files;
    let arr=[];
    photos.forEach(element => {
        arr.push({name:element.filename,
        path:element.path})
        
    });
    console.log(arr)
  
    if (!name || !description || !regular_price || !category || !brand || !stock || !status || !photos) {
      // Handle missing form data
      return res.render('admin-add-product', {
        error: 'Please fill out all the required fields and upload at least one photo.',
      });
    }
  
    // Save the data and image IDs to your 'product' model
    const photoIds = arr.map((photo) => photo.path);
  
    const newProduct = new product({
      name,
      description,
      regular_price,
      selling_price,
      category,
      brand,
      stock,
      status,
      photos: photoIds, // Assuming you have a 'photos' field in your 'product' schema
    });
  
    newProduct.save();
    res.redirect('/')
  };

  //listing products
  module.exports.getProducts = async (req, res) => {
    try {
        const products = await product.find(); 
        res.render("admin-products-list", {products});
    } catch (error) {
        console.log(error);
        res.status(500).send("Error retrieving user data");
    }
};

// const getProducts = async (req, res) => {
//     try {
//       const products = await Product.find();
//       res.render('admin-products-list', { products });
//     } catch (error) {
//       // Handle error
//       res.status(500).send('Error retrieving products');
//     }
//   };

  