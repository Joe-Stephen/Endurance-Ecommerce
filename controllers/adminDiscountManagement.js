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
const discount = require("../model/discountModel");
const Category = require("../model/categoryModel");

//rendering discount management page
const getDiscountManagement= async (req, res)=>{
    try{
      const discountList = await discount.find().populate([
        {
          path: "discountedProduct",
          model: "product",
        },
        {
          path: "discountedCategory",
          model: "Category",
        },
      ]);
        res.render("adminDiscountManagement", {discountList })

    } catch (err) {
        console.log("An error happened while loading the discount page! :" + err);
        res.status(500).render("error-page", {
          message: "Error retrieving discount management!",
          errorMessage: err.message,
        });
      }
};

//add discount page
const getAddDiscount= async (req, res)=>{
    try{
        const products= await product.find()
        const categories= await Category.find()

        res.render("adminAddDiscount", {products, categories});

    } catch (err) {
        console.log("An error happened while loading the add discount page! :" + err);
        res.status(500).render("error-page", {
          message: "Error loading add discount page!",
          errorMessage: err.message,
        });
      }
};

const postAddDiscount = async (req, res) => {
  try {
    const { name, discountOn, discountedProduct, discountedCategory, discountType, discountValue, maxRedeemableAmt, startDate, endDate } = req.body;
    console.log("the disc value for percentage option =  "+discountValue);

    // Check if a discount with the same name already exists
    const existingName = await discount.find({ name: name });
    if (existingName.length > 0) {
      return res.status(400).json({ message: "There is already a discount with that name!" });
    }

    // Check for existing discounts for the given category or product
    let existingDiscountPeriod;
    if (discountOn === "category") {
      existingDiscountPeriod = await discount.findOne({
        discountedCategory: discountedCategory,
        endDate: { $gte: new Date() }, // Existing discount's end date is greater than or equal to the current date
      });
    } else if (discountOn === "product") {
      existingDiscountPeriod = await discount.findOne({
        discountedProduct: discountedProduct,
        endDate: { $gte: new Date() }, // Existing discount's end date is greater than or equal to the current date
      });
    }

    if (existingDiscountPeriod && new Date(startDate) <= existingDiscountPeriod.endDate) {
      return res.status(400).json({ message: `There is already an active discount for this ${discountOn}.` });
    }

    // Create a new Discount document
    const newDiscount = new discount({
      name,
      discountOn,
      discountType,
      discountValue,
      startDate,
      endDate,
    });

    if (discountType === "percentage") {
      newDiscount.maxRedeemableAmt = maxRedeemableAmt;
    } else {
      newDiscount.maxRedeemableAmt = discountValue;
    }

    if (discountOn === "product") {
      const discProd = await product.findById(discountedProduct);
      newDiscount.discountedProduct = discProd; 
      if(discountType === "fixedAmount"){ 
    const itemDoc= await product.findByIdAndUpdate(discountedProduct,{$set:{discount:discountValue, offerStart:startDate, offerEnd:endDate}});
      }else{
        const itemDoc= await product.findByIdAndUpdate(discountedProduct,{$set:{discount:maxRedeemableAmt, offerStart:startDate, offerEnd:endDate}});
      }
    } else {
      const discCat = await Category.findById(discountedCategory);
      newDiscount.discountedCategory = discCat;
      if(discountType === "fixedAmount"){ 
        const itemDoc= await Category.findByIdAndUpdate(discountedCategory,{$set:{discount:discountValue, offerStart:startDate, offerEnd:endDate}});
          }else{
            const itemDoc= await Category.findByIdAndUpdate(discountedCategory,{$set:{discount:maxRedeemableAmt, offerStart:startDate, offerEnd:endDate}});
          }
    }

    // Save the document to the MongoDB collection
    const savedDiscount = await newDiscount.save();


    // Handle success response
    return res.status(200).json({
      status: 'success',
      data: savedDiscount,
     }); 
   } catch (err) {
       console.log(
         "An error occured while loading the edit discount page! : " + err
       );
       res
         .status(500)
         .render("error-page", {
           message: "An error happened !",
           errorMessage: err.message,
         });
     }
};

//toggle discount status
const toggleDiscountStatus= async (req, res)=>{
  try{
    const discountId = req.params.discountId;
    console.log("id----" + discountId);
    const newStatus = req.body.status;
    console.log("status----" + newStatus);
    const UpdatedDiscount = await discount.findByIdAndUpdate(discountId, {
      isActive: newStatus,
    });
    res.status(200).json({ status: UpdatedDiscount.isActive });


    } catch (err) {
    console.log("An error happened while updating discount status! :" + err);
    res.status(500).render("error-page", {
      message: "Error updating discount status!",
      errorMessage: err.message,
    });
  }
};

//edit discount
const getEditDiscount = async (req, res) => {
  try {
    const products= await product.find()
    const categories= await Category.find()
    const discountDoc = await discount.findById(req.query.discountId).populate([
      {
        path: "discountedProduct",
        model: "product",
      },
      {
        path: "discountedCategory",
        model: "Category",
      },
    ]);
    res.render("adminEditDiscount", { discountDoc, products, categories });
  } catch (err) {
    console.log(
      "An error occured while loading the edit discount page! : " + err
    );
    res
      .status(500)
      .render("error-page", {
        message: "An error happened !",
        errorMessage: err.message,
      });
  }
};

//updating the discount details
const saveEditedDiscount= async (req, res) => {
  try {
    const { discountId, name, discountOn, discountType, discountValue, startDate, endDate, discountedCategory, discountedProduct, maxRedeemableAmt } = req.body;
    console.log(discountType, discountValue, maxRedeemableAmt)
    const existingDiscount= await discount.findById(discountId );
    console.log("old doc == "+existingDiscount)
    let existingName= await discount.find({name:name, _id: { $ne: discountId }});
    console.log("name== "+existingName)
    if(existingName&&existingName.length>0){
      return res.status(404).json({ message:"There is already a discount with that name!"});
    }
    let existingCategory;
    let existingProduct;
    if (discountOn === 'category') {
      console.log("entered the category condition!!")
      const existingCategoryPeriod = await discount.findOne({
        discountedCategory: discountedCategory,
        endDate: { $gte: new Date() },
        _id: { $ne: discountId }
        // Existing discount's end date is greater than or equal to the current date
      });
      if (existingCategoryPeriod && new Date(startDate) <= existingCategoryPeriod.endDate) {
        return res.status(404).json({ message: "The category already has an active discount." });
      }
    }
     else {
      if (discountOn === 'product') {
        console.log("entered the product condition!!")
        const existingProductPeriod = await discount.findOne({
          discountedProduct: discountedProduct,
          endDate: { $gte: new Date() },
           _id: { $ne: discountId }
           // Existing discount's end date is greater than or equal to the current date
        });
        if (existingProductPeriod && new Date(startDate) <= existingProductPeriod.endDate) {
          return res.status(404).json({ message: "The product already has an active discount." });
        }
      }
    }
      const discountDoc = await discount.findById(discountId);
    discountDoc.name = name;
    discountDoc.discountOn = discountOn;
    discountDoc.discountType = discountType;
    discountDoc.discountValue = discountValue;
    if (discountOn === 'category') {
     discountDoc.discountedCategory = discountedCategory;
     if(discountType === "fixedAmount"){ 
      const itemDoc= await Category.findByIdAndUpdate(discountedCategory,{$set:{discount:discountValue, offerStart:startDate, offerEnd:endDate}});
        }else{
          const itemDoc= await Category.findByIdAndUpdate(discountedCategory,{$set:{discount:maxRedeemableAmt, offerStart:startDate, offerEnd:endDate}});
        }
    } else if (discountOn === 'product') {
     discountDoc.discountedProduct = discountedProduct;
     if(discountType === "fixedAmount"){ 
      const itemDoc= await product.findByIdAndUpdate(discountedProduct,{$set:{discount:discountValue, offerStart:startDate, offerEnd:endDate}});
        }else{
          const itemDoc= await product.findByIdAndUpdate(discountedProduct,{$set:{discount:maxRedeemableAmt, offerStart:startDate, offerEnd:endDate}});
        }
    }
    if (discountType === 'percentage') {
     discountDoc.maxRedeemableAmt = maxRedeemableAmt;
    }
    discountDoc.startDate = startDate;
    discountDoc.endDate = endDate;
    if(existingDiscount.discountedCategory&&discountedProduct){
      await discount.updateOne({_id:discountId},{$unset:{discountedCategory:1},$set:{discountedProduct:discountedProduct}});
    }
    if(existingDiscount.discountedProduct&&discountedCategory){
      await discount.updateOne({_id:discountId},{$unset:{discountedProduct:1},$set:{discountedCategory:discountedCategory}});
    }
    await discountDoc.save();
    console.log("new doc =="+discountDoc);
   return res.status(200).json({
     status: 'success',
     data: discountDoc,
    }); 
  } catch (err) {
      console.log(
        "An error occured while loading the edit discount page! : " + err
      );
      res
        .status(500)
        .render("error-page", {
          message: "An error happened !",
          errorMessage: err.message,
        });
    }
 };
 




module.exports = {
    getDiscountManagement,
    getAddDiscount,
    postAddDiscount,
    toggleDiscountStatus,
    getEditDiscount,
    saveEditedDiscount,
};
