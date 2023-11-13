const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/admin");
    }
    req.admin = decoded;
    next();
  });
};



