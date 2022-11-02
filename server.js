/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ___Ruyuan Sun___ Student ID: __101836229___ Date: __Oct 20, 2022______
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
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

var HTTP_PORT = process.env.PORT || 8080; 

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.use(express.static('public')); 
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: { 
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }        
    }
}));

function onHttpStart() {
    console.log("Express http server listening on port " + HTTP_PORT);
}

app.get("/", (req, res) => {
    res.redirect("/blog"); 
});


app.get("/about", (req, res) => {
    res.render(path.join(__dirname, "/views/about.hbs"));  
});

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blog.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get("/posts", (req, res) => {
    let value = req.query.category; 
    let day = req.query.minDate;


    if (value) {
        blog.getPostsByCategory(value).then((data) => {
            res.render("posts", {posts: data});
        }).catch((err) => {
            //res.json({ message: "Unable to get posts in the category " + value + ": " + err });
            res.render("posts", {message: "Unable to get posts in the category " + value + ": " + err });
        });
    }

    else if (day) {
        blog.getPostsByMinDate(day).then((data) => {
            res.render("posts", {posts: data});
        }).catch((err) => {
            //res.json({ message: "Unable to get posts on or after the day " + day + ": " + err });
            res.render("posts", {message: "Unable to get posts on or after the day " + day + ": " + err });
        });
    }

    else { 
        blog.getAllPosts().then((data) => {  
            res.render("posts", {posts: data});
        }).catch((err) => {
            console.log("Unable to get posts: " + err);
        }); 
    }
});

app.get("/categories", (req, res) => {
    blog.getCategories().then((data) => { 
        res.render("categories", {categories: data});
    }).catch((err) => {
        //console.log("Unable to get categories: " + err);
        res.render("categories", {message: "Unable to get categories: " + err});
    });
});

app.get("/posts/add", (req, res) => {
    res.render(path.join(__dirname, "/views/addPost.hbs")); 
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
        blog.addPost(req.body).then(() => {    //NOTE: req.body will fetch the data from the form, and addBlog will add the data to the temporary array on the page /posts, but not save the data to the array in posts.json
            res.redirect("/posts");
        });
    });
});

app.get("/posts/:value", (req, res) => {
    let ID = req.params.value; 
    blog.getPostById(ID).then((data) => { 
        res.json(data);   //json(data) converts data from the format in JavaScript to json
    }).catch((err) => {
        res.json({ message: "Unable to get posts with ID " + ID + ": " + err });
    });
});

app.use((req, res) => {   //if the page is 404 not found()
    res.status(404).render(path.join(__dirname, "/views/404.hbs"));
});

blog.initialize().then(function () {   
    app.listen(HTTP_PORT, onHttpStart); 
}).catch(function (err) {  //if an error occurs
    console.log("Unable to start server: " + err);
});
