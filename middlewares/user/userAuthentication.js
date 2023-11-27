const jwt = require("jsonwebtoken");
require("dotenv").config();
const user = require("../../model/userModel");

module.exports.verifyUser = async (req, res, next) => {
  try {
    const userToken = req.cookies.userToken;
    // Continue with token verification
    jwt.verify(userToken, process.env.JWT_SECRET, async (err, decoded) => {
      try {
        const userData = await user.findOne({ email: decoded });
        // Debugging logs
        console.log(userData);
        if (userData&&userData.status === "Blocked") {
          // Clear cookies and render a message for blocked accounts
          return res.render("page-login-register", {
            subreddit: "Your account is currently blocked!",
          });
        }
        if (err) {
          return res.redirect("/getLogin");
        }
        req.user = decoded;
        next();
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
};
