const admin = require("../model/adminModel");
const coupon = require("../model/couponModel");
const category = require("../model/categoryModel");
const product = require("../model/productModel");
const order = require("../model/orderModel");
const user = require("../model/userModel");
const multer = require("multer");

//get coupon management
const getCouponManagement = async (req, res) => {
  try {
    const couponList = await coupon.find();
    res.render("admin-coupon-management", { couponList });
  } catch (err) {
    console.log("An error happened while loading the coupon page! :" + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//get add coupon
const getAddCoupon = async (req, res) => {
  try {
    res.render("adminAddCoupon");
  } catch (err) {
    console.log("An error happened while loading the add-coupon page! :" + err);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//edit coupon
const getEditCoupon = async (req, res) => {
  try {
    const couponDoc = await coupon.findById(req.query.couponId);
    res.render("adminEditCoupon", { couponDoc });
  } catch (err) {
    console.log(
      "An error occured while loading the edit coupon page! : " + err
    );
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//saving edited coupon
const saveEditedCoupon = async (req, res) => {
  try {
    const couponCode = req.body.code;
    const couponId = req.body.couponId;

    // Check if the coupon code is unique
    const existingCoupon = await coupon.findOne({
      code: couponCode,
      _id: { $ne: couponId },
    });
    if (existingCoupon) {
      // The coupon code already exists for another coupon, so return an error
      return res.status(400).json({ error: "Coupon code already exists" });
    }

    // Check if the expiration date is not in the past
    const expirationDate = new Date(req.body.expirationDate);
    if (expirationDate < new Date()) {
      return res
        .status(400)
        .json({ error: "Expiration date must be in the future" });
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
      return res.status(404).json({ error: "Coupon not found" });
    }

    // Return the updated coupon document
    res.json(updatedCoupon);
  } catch (error) {
    console.error(
      "An error occurred while saving the edited coupons: " + error
    );
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//save coupon to db
const saveCoupon = async (req, res) => {
  try {
    const couponCode = req.body.code;
    console.log("codeasdfsadf " + req.body.formData);
    const existingCoupon = await coupon.findOne({ code: couponCode });
    if (existingCoupon) {
      // The coupon code already exists, so return an error
      return res.status(400).json({ error: "Coupon code already exists" });
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
  } catch (err) {
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//toggle coupon status
const toggleCouponStatus = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    console.log("id----" + couponId);
    const newStatus = req.body.status;
    console.log("status----" + newStatus);
    const UpdatedCoupon = await coupon.findByIdAndUpdate(couponId, {
      isActive: newStatus,
    });
    res.status(200).json({ status: UpdatedCoupon.isActive });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

module.exports = {
  getCouponManagement,
  getAddCoupon,
  getEditCoupon,
  saveEditedCoupon,
  saveCoupon,
  toggleCouponStatus,
};
