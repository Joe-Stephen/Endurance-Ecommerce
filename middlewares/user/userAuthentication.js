const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/loginPage");
    }
    req.user = decoded;
    next();
  });
};


const isUserAuthentic=async(req, res, next) => {
  // Get the JWT token from cookies or headers
  const token = req.cookies.token || req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication failed. Token is missing." });
  }

  // Verify the token using your secret key (stored in your environment variables)
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Invalid token." });
    }

    // If the token is valid, store the decoded user information in the request object
    req.user = decoded;
    // res.status(200).send('User is authenticated');
    next();
  });
};

module.exports= {verifyUser, isUserAuthentic}


// const verifyUser= (req, res, next)=>{
//     const token = req.cookies.userToken
//     // console.log(req.cookies)
//     const verifyToken=jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
//         console.log(decoded);
//         req.user=decoded;
//         if(!decoded){
//             res.redirect('/')
//         }else{
//             next();
//         }
//       })
//     next();
// }
