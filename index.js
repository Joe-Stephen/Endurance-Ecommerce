const mongoose=require("mongoose")
const dburl="mongodb://127.0.0.1:27017/endurance"
const express=require ("express")
const app=express();
const db=mongoose.connect(dburl)
const user=require('./model/userModel')
const admin=require('./model/adminModel')
const userRouter= require('./routers/userRouter');
const adminRouter= require('./routers/adminRouter');
const session = require("express-session");
const { v4: uuidv4 } = require("uuid"); // Import the uuidv4 function
const cookieParser = require("cookie-parser");
const nocache = require("nocache");
const productCol = require("./model/productModel");

app.use(nocache());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(
    session({
      secret: uuidv4(),
      resave: false,
      saveUninitialised: false,
    })
  );
  
//setting folder for serving static files
app.use(express.static(__dirname+'/public'));
app.use("/uploads",express.static('uploads'));

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
// Define a route for viewing a product by its ID
app.get('/product/:productId', async (req, res) => {
    const productId = req.params.productId;

    try {
        // Fetch the product details based on the productId
        const product = await productCol.findById(productId);

        if (!product) {
            // Handle the case when the product is not found
            return res.status(404).send('Product not found');
        }

        // Render the "product-page" template and pass the product details
        res.render('product-page', { product });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching product details');
    }
});


//route for home(user login)
app.get('/',async (req,res)=>{
    try{
        const products= await productCol.find();
        console.log(products)
        res.render('index-4',{products:products});
    }catch(error){
        console.error(error);
        res.status(500).send('Error fetching products');
    }
});

app.get('/admin',(req,res)=>{
    res.render('admin-login-page');
});

// Express route to update user status
// Update user status and return the updated user data
app.post('/update-user-status/:userId', async (req, res) => {
    const userId = req.params.userId;
    const newStatus = req.body.status;

    try {
        // Find the user by ID and update the status
        const updatedUser = await user.findByIdAndUpdate(userId, { status: newStatus });

        res.status(200).json({ status: updatedUser.status });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user status.');
    }
});

// Express route to update product status
// Update product status and return the updated product data
app.post('/update-product-status/:productId', async (req, res) => {
    const productId = req.params.productId;
    const newStatus = req.body.status;

    try {
        // Find the product by ID and update the status
        const updatedProduct = await productCol.findByIdAndUpdate(productId, { status: newStatus });

        res.status(200).json({ status: updatedProduct.status });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating product status.');
    }
});




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