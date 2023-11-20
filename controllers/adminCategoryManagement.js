const admin = require("../model/adminModel");
const coupon = require("../model/couponModel");
const category = require("../model/categoryModel");
const product = require("../model/productModel");
const order = require("../model/orderModel");
const user = require("../model/userModel");
const multer = require("multer");

// Assuming you fetch the categories from your database
const getCategories = async (req, res) => {
  try {
    const categories = await category.find(); // Replace with your actual Category model
    console.log(categories);

    res.render("admin-category-management", { categories });
  } catch (error) {
    // Handle the error
    console.error(error);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

const postAddCategory = async (req, res) => {
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
    res.redirect("/admin/admin-category-management"); // Change this URL as needed
  } catch (err) {
    // Handle any errors that occur during category creation
    console.error("An error occurred while adding the category: " + err);

    // Redirect to an error page or show an error message
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//edit category
const editCategory = async (req, res) => {
  try {
    const categoryDetails = await category.findById(req.params.categoryId);
    res.render("admin-category-edit", { categoryDetails });
  } catch (err) {
    console.log("An error happened while getting edit category! :" + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

// Post edit category
const postEditCategory = async (req, res) => {
  try {
    const categoryId = req.body.categoryId; // Get the category ID from the form
    const { name, description } = req.body;
    let updatedData = {
      name,
      description,
    };

    await category.findByIdAndUpdate(categoryId, updatedData, { new: true });
    const successMessage = "Category updated successfully";

    res.redirect("/admin/admin-category-management");
  } catch (error) {
    console.log("An error has occurred while editing the category: " + error);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

// Deleting category
const deleteCategory = async (req, res) => {
  try {
    await category.deleteOne({ _id: req.params.categoryId });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log("An error happened while deleting the category:" + error);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

module.exports = {
  getCategories,
  postAddCategory,
  editCategory,
  postEditCategory,
  deleteCategory,
};
