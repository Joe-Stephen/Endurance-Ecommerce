const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.verifyAdmin = (req, res, next) => {

  const adminToken = req.cookies.adminToken;
  jwt.verify(adminToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("error");

      return res.redirect("/admin");
    }
    req.admin = decoded;
    next();
  });
};