const admin = require("../model/adminModel");
const coupon = require("../model/couponModel");
const category = require("../model/categoryModel");
const product = require("../model/productModel");
const order = require("../model/orderModel");
const user = require("../model/userModel");
const multer = require("multer");

//getting the product list
const getProductsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 10;

    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);

    const skip = (page - 1) * no_of_docs_each_page;

    const products = await product
      .find()
      .skip(skip)
      .limit(no_of_docs_each_page);

    // const products = await product.find({});
    res.render("admin-products-list", { products, page, totalPages });
  } catch (error) {
    console.log(error);
    res.status(500).render("error-page", {
      message: "Error retrieving user data!",
      errorMessage: err.message,
    });
  }
};

// get add product
const getAddProduct = async (req, res) => {
  try {
    const categories = await category.find();
    res.render("admin-add-product", { categories });
  } catch (err) {
    console.log("An error happened while loading the add product page!:" + err);
    res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

// POST request to add a new product
const postAddProduct = async (req, res) => {
  try {
    const { name, description, regular_price, selling_price, category, brand } =
      req.body;
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

    let sizeSmall = 0;
    let sizeMedium = 0;
    let sizeLarge = 0;
    if (req.body.sizeSmall) {
      sizeSmall = req.body.stockSmall;
    }
    if (req.body.sizeMedium) {
      sizeMedium = req.body.stockMedium;
    }
    if (req.body.sizeLarge) {
      sizeLarge = req.body.stockLarge;
    }

    const sizes = [
      {
        small: sizeSmall,
        medium: sizeMedium,
        large: sizeLarge,
      },
    ];

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
    console.log("Haiiii   " + newProduct);
    // Save the product to the database

    newProduct.save();
    res.redirect("/admin/admin-products-list"); // Redirect to the product list page or perform other actions
  } catch (err) {
    console.log("error  " + err);
    res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

//change product status
const postProductStatus = async (req, res) => {
  const productId = req.params.productId;
  const newStatus = req.body.status;
  try {
    const updateProduct = await product.findByIdAndUpdate(productId, {
      status: newStatus,
    });
    res.status(200).json({ status: updateProduct.status });
  } catch (err) {
    console.error(err);
    res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

//geting edit product
const getEditProduct = async (req, res) => {
  try {
    const categories = await category.find();
    const editId = req.query.productId;

    console.log(editId);
    // Fetch the product details based on the productId
    const editProduct = await product.findById(editId);

    // console.log(products)

    if (!editProduct) {
      // Handle the case when the product is not found
      return res.send("Product not found");
    }

    // Render the "product-page" template and pass the product details
    res.render("admin-prdouct-edit-page", { editProduct, categories });
  } catch (error) {
    console.error(error);
    res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

const deleteProductPhoto = async (req, res) => {
  try {
    console.log("function called!");
    const productId = req.params.productId;
    const index = req.query.index;
    console.log("index==" + index);
    console.log("id ==" + productId);

    // Find the product by ID
    const editProduct = await product.findById(productId);

    if (!editProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure the index is within the bounds of the photos array
    if (index < 0 || index >= editProduct.photos.length) {
      return res.status(400).json({ message: 'Invalid photo index' });
    }

    // Remove the photo at the specified index
    editProduct.photos.splice(index, 1);

    // Save the updated product
    await editProduct.save();

    // Respond with a success status code
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


//saving edited details into the db
const postEditProduct = async (req, res) => {
  try {
    console.log("hello from post edit");
    const editId = req.params.productId;
    const existingProduct = await product.findById(editId);
    const { name, description, regular_price, selling_price, category, brand } =
      req.body;
    // Get newly uploaded photos
    const photos = req.files;
    const newPhotos = photos.map((element) => ({
      name: element.filename,
      path: element.path,
    }));
    let updatedPhotos=[];
    if(existingProduct.photos.length==0){
      console.log("entered the 0 photos case!");
      newPhotos.forEach((pic)=>{
        updatedPhotos.push(pic.path)
      });
    }else{
       picPaths = newPhotos.map((photo) => photo.path);
    // Include old photos that weren't edited
     updatedPhotos = existingProduct.photos.map((oldPhoto, index) =>
      picPaths[index] ? picPaths[index] : oldPhoto
    );
    }
    
    let sizeSmall = existingProduct.sizes.small;
    let sizeMedium = existingProduct.sizes.medium;
    let sizeLarge = existingProduct.sizes.large;
    if (req.body.sizeSmall) {
      sizeSmall = req.body.stockSmall;
    }
    if (req.body.sizeMedium) {
      sizeMedium = req.body.stockMedium;
    }
    if (req.body.sizeLarge) {
      sizeLarge = req.body.stockLarge;
    }
    const sizes = 
      {
        small: sizeSmall,
        medium: sizeMedium,
        large: sizeLarge,
      }
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
    const updatedProduct = await product.findByIdAndUpdate(
      editId,
      updatedData,
      { new: true }
    );
    const successMessage = "Product updated successfully";
    // console.log(updatedProduct);
    res.redirect("/admin/admin-products-list");
  } catch (error) {
    console.log(error);
    res.render("admin-product-edit-page", {
      error: "An error occurred while updating the product, please try again",
    });
  }
};

//deleting a product
const deleteProduct = async (req, res) => {
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
    res.status(500).render("error-page", {
      message: "An error happened !",
      errorMessage: err.message,
    });
  }
};

module.exports = {
  getProductsList,
  getAddProduct,
  postAddProduct,
  postProductStatus,
  getEditProduct,
  deleteProductPhoto,
  postEditProduct,
  deleteProduct,
};
