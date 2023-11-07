const admin = require("../model/adminModel");
const category=require("../model/categoryModel")
const product = require("../model/productModel");
const order  = require("../model/orderModel")
const user = require("../model/userModel");
const multer = require("multer");

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
module.exports.getAddProduct = async (req, res) => {
  try{
    const categories= await category.find();
    res.render("admin-add-product", {categories});
  }
  catch(error){
    console.log("An error happened while loading the add product page!:"+error)
  }
};


// POST request to add a new product
module.exports.postAddProduct = async (req, res) => {
  try{
  const {
    name,
    description,
    regular_price,
    selling_price,
    category,
    brand,
  } = req.body;
  // Handle file uploads and create an array of photo objects
  const photos = req.files;
  let arr = [];
  photos.forEach((element) => {
    arr.push({ name: element.filename, path: element.path });
  });

  // Ensure that required fields are not empty
  if (
    !name ||
    !description ||
    !regular_price ||
    !category ||
    !brand ||
    !photos
  ) {
    return res.render("admin-products-list", {
      error:
        "Please fill out all the required fields and upload at least one photo.",
    });
  }

  const photoIds = arr.map((photo) => photo.path);

let sizeSmall=0;
let sizeMedium=0;
let sizeLarge=0;
  if(req.body.sizeSmall){
    sizeSmall=req.body.stockSmall
  } 
  if(req.body.sizeMedium){
    sizeMedium=req.body.stockMedium
  } 
  if(req.body.sizeLarge){
    sizeLarge=req.body.stockLarge
  } 


  const sizes=[{
    small:sizeSmall,
    medium:sizeMedium,
    large:sizeLarge,
  }]

  // Create a new product document with size information
  const newProduct = new product({
    name,
    description,
    regular_price,
    selling_price,
    category,
    brand,
    sizes, // Store the size
    photos: photoIds,
  });
console.log("Haiiii   "+newProduct)
  // Save the product to the database

  newProduct.save();
      res.redirect("/admin/admin-products-list"); // Redirect to the product list page or perform other actions
    }
    catch(error){
      console.log("error  "+error);
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
    const categories= await category.find();
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
    res.render("admin-prdouct-edit-page", { editProduct, categories});
  } catch (error) {
    console.error(error);
    res.send("Error fetching product details");
  }
};

//saving edited details into the db
module.exports. postEditProduct = async (req, res) => {
  try {
    const editId = req.params.productId;
    const existingProduct = await product.findById(editId);

    const {
      name,
      description,
      regular_price,
      selling_price,
      category,
      brand,
    } = req.body;

    // Get newly uploaded photos
    const photos = req.files;
    const newPhotos = photos.map((element) => ({ name: element.filename, path: element.path }));
    const picPaths=newPhotos.map((photo) => photo.path);
    // Include old photos that weren't edited
    const updatedPhotos = existingProduct.photos.map((oldPhoto, index) =>
    picPaths[index] ? picPaths[index] : oldPhoto
    );
let sizeSmall=0;
let sizeMedium=0;
let sizeLarge=0;
  if(req.body.sizeSmall){
    sizeSmall=req.body.stockSmall
  } 
  if(req.body.sizeMedium){
    sizeMedium=req.body.stockMedium
  } 
  if(req.body.sizeLarge){
    sizeLarge=req.body.stockLarge
  } 


  const sizes=[{
    small:sizeSmall,
    medium:sizeMedium,
    large:sizeLarge,
  }]



    const updatedData = {
      name,
      description,
      regular_price,
      selling_price,
      category,
      brand,
      status: existingProduct.status,
      photos: updatedPhotos,
      sizes,
    };

    const updatedProduct = await product.findByIdAndUpdate(editId, updatedData, { new: true });
    const successMessage = "Product updated successfully";
    // console.log(updatedProduct);
    res.redirect('/admin/admin-products-list');
  } catch (error) {
    console.log(error);
    res.render("admin-product-edit-page", { error: "An error occurred while updating the product, please try again" });
  }
};

//deleting a product
module.exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Use Mongoose to find and delete the product by its ID
    const deletedProduct = await product.findByIdAndRemove(productId);

    if (!deletedProduct) {
      // If the product was not found, return an error response
      return res.status(404).json({ message: "Product not found" });
    }

    // If the product was successfully deleted, return a success response
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("An error occurred while deleting the product:", error);
    res.status(500).json({ error: "Internal server error" });
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
    res.render('admin-dashboard'); // Render an error page
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
      res.status(500).render('error-page'); // Change this URL to your error page
  }
};


//edit category
module.exports.editCategory= async (req, res)=>{
  try{
  const categoryDetails= await category.findById(req.params.categoryId);
  res.render("admin-category-edit", {categoryDetails});
  }
  catch(error){
    console.log("An error happened while getting edit category! :"+error);
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
      res.status(500).send('An error occurred');
  }
};

// Deleting category
module.exports.deleteCategory = async (req, res) => {
  try {
    await category.deleteOne({ _id: req.params.categoryId });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log("An error happened while deleting the category:" + error);
    res.status(500).json({ message: "An error occurred while deleting the category" });
  }
}


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
    console.log("user data: "+userData[0] );

    res.render("admin-order-management", { orderList, userData});
  } catch (error) {
    console.log("An error happened while loading order list!:" + error);
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
  catch(error){
    console.log("An error happened while accessing order details! :"+error);
  }
}

//editing order status
module.exports.editOrderStatus= async(req, res) =>{
  try{
    await order.updateOne({_id:req.body.orderId}, {$set:{orderStatus:req.body.orderStatus}});
    res.redirect("/admin/orderList");
  }
  catch(error){
    console.log("An error happened while editing the order status! :");
  }
}