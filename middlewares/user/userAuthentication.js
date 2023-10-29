const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/getLogin");
    }
    req.user = decoded;
    next();
  });
};



