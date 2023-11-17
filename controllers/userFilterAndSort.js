const express = require("express");
const adminRouter = express.Router();
const userRouter = express.Router();
const userController = require("../controllers/userController");
const product = require("../model/productModel");
const banner = require("../model/bannerModel");
const jwt = require("jsonwebtoken");
const userMiddleware = require("../middlewares/user/userAuthentication");
const cookieParser = require("cookie-parser");
userRouter.use(cookieParser());

//filter functions
//filter mtb
const filterByMTB = async (req, res) => {
  try {
    const banners= await banner.find();
    const page = req.query.page ?? 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    console.log(page);
    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const skip = (page - 1) * no_of_docs_each_page;
    const loggedIn = req.cookies.loggedIn;
    const products = await product.find({
      category: "MTB",
      status: { $ne: "hide" },
    });
    res.render("index-4", { products, loggedIn, totalPages, page, banners });
  } catch (err) {
    console.log("An error occured while applying filter! " + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

// filter electric
const filterByElectric = async (req, res) => {
  try {
    const banners= await banner.find();
    const page = req.query.page ?? 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    console.log(page);
    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const skip = (page - 1) * no_of_docs_each_page;
    const loggedIn = req.cookies.loggedIn;
    const products = await product.find({
      category: "E- bikes",
      status: { $ne: "hide" },
    });
    res.render("index-4", { products, loggedIn, totalPages, page, banners });
  } catch (err) {
    console.log("An error occured while applying filter! " + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

// filter endurance
const filterByEndurance = async (req, res) => {
  try {
    const banners= await banner.find();
    const page = req.query.page ?? 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    console.log(page);
    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const skip = (page - 1) * no_of_docs_each_page;
    const loggedIn = req.cookies.loggedIn;
    const products = await product.find({
      category: "Endurance bikes",
      status: { $ne: "hide" },
    });
    res.render("index-4", { products, loggedIn, totalPages, page, banners });
  } catch (err) {
    console.log("An error occured while applying filter! " + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//sorting functions

// Low to High with pagination
const sortLowToHigh = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    const skip = (page - 1) * no_of_docs_each_page;

    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });

    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const loggedIn = req.cookies.loggedIn;

    const products = await product
      .find({ status: { $ne: "hide" } })
      .sort({ selling_price: 1 })
      .skip(skip)
      .limit(no_of_docs_each_page);

    res.render("index-4", { products, loggedIn, totalPages, page });
  } catch (err) {
    console.log("An error occurred while applying filter! " + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

// High to Low with pagination
const sortHighToLow = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    const skip = (page - 1) * no_of_docs_each_page;

    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });

    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const loggedIn = req.cookies.loggedIn;

    const products = await product
      .find({ status: { $ne: "hide" } })
      .sort({ selling_price: -1 })
      .skip(skip)
      .limit(no_of_docs_each_page);

    res.render("index-4", { products, loggedIn, totalPages, page });
  } catch (err) {
    console.log("An error occurred while applying filter! " + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//price range sort
const sortPriceRange = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const no_of_docs_each_page = 6;
    const skip = (page - 1) * no_of_docs_each_page;
    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const loggedIn = req.cookies.loggedIn;
    // Extract the price range from the URL parameter
    const priceRange = req.params.priceRange.split("-");
    const minPrice = parseInt(priceRange[0], 10);
    const maxPrice = parseInt(priceRange[1], 10);
    // Use the price range in your database query
    const products = await product
      .find({
        status: { $ne: "hide" },
        selling_price: { $gte: minPrice, $lte: maxPrice },
      })
      .skip(skip)
      .limit(no_of_docs_each_page);
    res.render("index-4", { products, loggedIn, page, totalPages });
  } catch (err) {
    console.log(
      "An error occured while sorting according to price range! " + err
    );
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
    res.redirect("/");
  }
};

//sorting by brand
const sortByBrand = async (req, res) => {
  try {
    const banners= await banner.find();
    const brandName = req.query.brand;
    const page = req.query.page ?? 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 6;
    console.log(page);
    const totalProducts = await product.countDocuments({
      status: { $ne: "hide" },
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const skip = (page - 1) * no_of_docs_each_page;
    const loggedIn = req.cookies.loggedIn;
    const products = await product.find({
      brand: brandName,
      status: { $ne: "hide" },
    });
    console.log(products);
    res.render("index-4", { products, loggedIn, totalPages, page, banners });
  } catch (err) {
    console.log("An error happened while loading the brand results! :" + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

module.exports = {
  filterByMTB,
  filterByElectric,
  filterByEndurance,
  sortLowToHigh,
  sortHighToLow,
  sortPriceRange,
  sortByBrand,
};
