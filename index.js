const mongoose=require("mongoose")
const dburl="mongodb://127.0.0.1:27017/endurance"
const express=require ("express")
const app=express();
const db=mongoose.connect(dburl)
const userRouter= require('./routers/userRouter')
const adminRouter= require('./routers/adminRouter');
const cookieParser = require("cookie-parser");
const products = require("./model/productModel");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

  
//setting folder for serving static files
app.use(express.static(__dirname+'/public'));
app.use("/uploads",express.static('uploads'));

//setting default routes
app.use('/', userRouter);
app.use('/admin', adminRouter);

//setting folder for ejs files
app.set('view engine','ejs');

const port=3000;

app.listen(port,async(req,res)=>{
    await db;
    try{
        db.then((obj)=>{
            console.log("DB connected successfully");
        });
        db.catch((error)=>{
            console.log("There was an error while connecting to the database");
        });
        console.log("Server started")
        console.log(`The server is running on : http://localhost:${port}`);
    }catch(err){
        console.error(err);
    }
    
});

// route for product page
// Define a route for viewing a product by its ID\











// Express route to update product status
// Update product status and return the updated product data




//route for user signup
// app.get('/page-signup', (req, res)=>{
//     res.render('page-signup');
//     // res.render('index-4');

// });

//route for navigation to home page
// app.get('/index-4',(req, res)=>{
//     res.render('index-4');
// })

//route for home(when submit button is clicked)
// app.post('/submit',(req, res)=>{
//     res.redirect('index-4')
// });

//route for signup form submission
// app.get('/signup_submit',(req, res)=>{
//     const formData=req.body;
// //saving the data in the database
//     const document= new user({
        
//     })
// })

//code for 