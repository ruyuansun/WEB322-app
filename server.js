/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ___Ruyuan Sun___ Student ID: __101836229___ Date: __Oct 9, 2022______
*
*  Online (Cyclic) Link: https://spotless-erin-sheep.cyclic.app
*
********************************************************************************/ 

var express = require("express");    //variable "express" requires "express" library
var app = express(); 
var path = require("path");
const blog = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'djsdmrkr5',
    api_key: '943819914563728',
    api_secret: 'e7fywduqzZZijADhdvn8rTDZ48s',
    secure: true
});
const upload = multer();
const streamifier = require('streamifier');

var HTTP_PORT = process.env.PORT || 8080; 

app.use(express.static('public')); 

function onHttpStart() {
    console.log("Express http server listening on port " + HTTP_PORT);
}

app.get("/", (req, res) => {
    res.redirect("/about"); 
});


app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));  
});

app.get("/blog", (req, res) => {
    blog.getPublishedPosts().then((data) => {    
        res.json(data);   //json(data) converts data from the format in JavaScript to json
    }).catch((err) => {
        console.log("Unable to get published posts: " + err);
    });
});

app.get("/posts", (req, res) => {
    let value = req.query.category; 
    let day = req.query.minDate;


    if (value) {
        blog.getPostsByCategory(value).then((data) => {
            res.json(data);
        }).catch((err) => {
            console.log("Unable to get posts in the category " + value + ": " + err);
        });
    }

    else if (day) {
        blog.getPostsByMinDate(day).then((data) => {
            res.json(data);
        }).catch((err) => {
            console.log("Unable to get posts on or after the day " + day + ": " + err);
        });
    }

    else { 
        blog.getAllPosts().then((data) => {  
            res.json(data);   //json(data) converts data from the format in JavaScript to json
        }).catch((err) => {
            console.log("Unable to get posts: " + err);
        }); 
    }
});

app.get("/categories", (req, res) => {
    blog.getCategories().then((data) => { 
        res.json(data);   //json(data) converts data from the format in JavaScript to json
    }).catch((err) => {
        console.log("Unable to get categories: " + err);
    });
});

app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html")); 
});

app.post("/posts/add", upload.single("featureImage"), function (req, res, next) {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;

        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blog.addBlog(req.body).then(() => {    //NOTE: req.body will fetch the data from the form, and addBlog will add the data to the temporary array on the page /posts, but not save the data to the array in posts.json
            res.redirect("/posts");
        });
    });
});

app.get("/posts/:value", (req, res) => {
    let ID = req.params.value; 
    blog.getPostById(ID).then((data) => { 
        res.json(data);   //json(data) converts data from the format in JavaScript to json
    }).catch((err) => {
        console.log("Unable to get posts with ID " + ID + ": " + err);
    });
});

app.use((req, res) => {   //if the page is 404 not found(), send error message to the web page
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

blog.initialize().then(function () {   
    app.listen(HTTP_PORT, onHttpStart); 
}).catch(function (err) {  //if an error occurs
    console.log("Unable to start server: " + err);
});
