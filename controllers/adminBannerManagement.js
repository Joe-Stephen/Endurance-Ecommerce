require("dotenv").config();
const user = require("../model/userModel");
const address = require("../model/addressModel");
const razorpay = require("../razorPay");
const razorPay_key_id = process.env.razorPay_key_id;
const razorPay_key_secret = process.env.razorPay_key_secret;
const wallet = require("../model/walletModel");
const order = require("../model/orderModel");
const returns = require("../model/returnModel");
const cancels = require("../model/cancelModel");
const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const twilio_account_sid = process.env.twilio_account_sid;
const twilio_auth_token = process.env.twilio_auth_token;
const twilio_serviceId = process.env.twilio_serviceId;
const twilio = require("twilio")(twilio_account_sid, twilio_auth_token);
const product = require("../model/productModel");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const cart = require("../model/cartModel");
const wishlist = require("../model/wishlistModel");
const coupon = require("../model/couponModel");
const banner = require("../model/bannerModel");
const Category = require("../model/categoryModel");

//banner management page rendering
const getBannerManagement = async (req, res) => {
  try {
    const banners= await banner.find();
    res.render("adminBannerManagement", {banners});
  } catch (err) {
    console.log("An error happened while loading the banner page! :" + err);
    res.status(500).render("error-page", {
      message: "Error retrieving banner management!",
      errorMessage: err.message,
    });
  }
};

//add banner page rendering
const getAddBanner = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("adminAddBanner", { categories });
  } catch (err) {
    console.log("An error happened while loading the page! :" + err);
    res.status(500).render("error-page", {
      message: "Error retrieving add-banner management!",
      errorMessage: err.message,
    });
  }
};

const postAddBanner = async (req, res) => {
  try {
    // Extract data from the request body
    const { name, type, link, startDate, endDate, status } =
      req.body;

    // Handle file upload using Multer
    const photoPath = req.file ? `uploads/${req.file.filename}` : null;
    // Fix the typo in the following line
    let isActive;
    if(status === "active"){
        isActive=true;
    }else{
        isActive=false;
    }

    // Create a new banner instance
    const newBanner = new banner({
      title: name,
      type: type,
      link:link,
      startDate: startDate,
      endDate: endDate,
      isActive: isActive,
      photo: photoPath,
    });

    // Save the banner to the database
    await newBanner.save();

    res
      .status(200)
      .json({ success: true, message: "Banner added successfully" });
  } catch (err) {
    console.log("An error happened while adding the banner! :" + err);
    res.status(500).render("error-page", {
      message: "Error adding the banner",
      errorMessage: err.message,
    });
  }
};

//toggle coupon status
const toggleBannerStatus = async (req, res) => {
    try {
      const bannerId = req.params.bannerId;
      console.log("id----" + bannerId);
      const newStatus = req.body.status;
      console.log("status----" + newStatus);
      const UpdatedBanner = await banner.findByIdAndUpdate(bannerId, {
        isActive: newStatus,
      });
      res.status(200).json({ status: UpdatedBanner.isActive });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .render("error-page", {
          message: "An error happened !",
          errorMessage: err.message,
        });
    }
  };

  //edit banner
const getEditBanner = async (req, res) => {
    try {
      const bannerDoc = await banner.findById(req.query.bannerId);
      res.render("adminEditBanner", { bannerDoc });
    } catch (err) {
      console.log(
        "An error occured while loading the edit banner page! : " + err
      );
      res
        .status(500)
        .render("error-page", {
          message: "An error happened !",
          errorMessage: err.message,
        });
    }
  };


//saving edited banner
const saveEditedBanner = async (req, res) => {
    try {
      const bannerId = req.body.bannerId;
      console.log(bannerId);
      console.log(req.body.name, req.body.type, req.body.link, req.body.startDate, req.body.endDate);
      
      // Check if the expiration date is not in the past
      const endDate = new Date(req.body.endDate);
      console.log(endDate);
  
      if (endDate < new Date()) {
        return res
          .status(400)
          .json({ error: "Expiration date must be in the future" });
      }
      
      const photoPath = req.file ? `uploads/${req.file.filename}` : null;
  
      // Update the existing banner document with the new data
      const updatedBanner = await banner.findByIdAndUpdate(
        bannerId,
        {
          title: req.body.name,
          type: req.body.type,
          link: req.body.link,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          photo: photoPath,
        },
        { new: true } // Return the updated document
      );
      
      console.log(updatedBanner);
  
      if (!updatedBanner) {
        // banner with the given ID not found
        return res.status(404).json({ error: "banner not found" });
      }
  
      // Return the updated banner document
      res.json(updatedBanner);
    } catch (err) {
      console.error("An error occurred while saving the edited banners: " + err);
      res.status(500).json({
        success: false,
        error: "An error happened!",
        errorMessage: err.message,
      });
    }
  };
    




module.exports = {
  getBannerManagement,
  getAddBanner,
  postAddBanner,
  toggleBannerStatus,
  getEditBanner,
  saveEditedBanner,
};
