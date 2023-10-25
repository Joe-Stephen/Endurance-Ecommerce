const mongoose = require("mongoose");
const dburl = "mongodb://127.0.0.1:27017/endurance";
const express = require("express");
const app = express();
const db = mongoose.connect(dburl);
const userRouter = require('./routers/userRouter');
const adminRouter = require("./routers/adminRouter");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setting default routes



// Setting folder for serving static files
app.use(express.static(__dirname + '/public'));
app.use("/uploads", express.static('uploads'));

// Setting folder for ejs files
app.set("view engine", "ejs");

app.use("/", userRouter);
app.use("/admin", adminRouter)

const port = 3000;
app.listen(port, async () => {
    await db;
    try {
        db.then((obj) => {
            console.log("DB connected successfully");
        });
        db.catch((error) => {
            console.log("There was an error while connecting to the database");
        });
        console.log("Server started");
        console.log(`The server is running on: http://localhost:${port}`);
    } catch (err) {
        console.error(err);
    }
});
