const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
require('dotenv').config()





const verifyUser= (req, res, next)=>{
    const token = req.cookies.token;
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.redirect("/loginPage");
        } 
        req.user = decoded;
        next();
      });};


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



module.exports=verifyUser;
