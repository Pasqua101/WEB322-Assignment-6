/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Marco Pasqua Student ID: 1000497213 Date: Monday, October 31st, 2022
*
*  Online (Heroku) Link: https://morning-bayou-26172.herokuapp.com/ //NOTE: BEFORE RUNNING CODE CHANGE HEROKU app
*
********************************************************************************/


var express = require("express");
var app = express();
var path = require('path');
// Using path to find the location of the file so it can redirect the user to the html page

// Importing modules installed from npm to server.js (Assignment 3)
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const e = require("express");
const exphbs = require("express-handlebars"); //Including express-handlebars for Assignment 4
const stripJs = require('strip-js'); //Including strip-js, to remove all script tags in html files (Assignment 4)
app.use(express.urlencoded({extended: true}))
// Setting up cloudinary to get what it needs
cloudinary.config({cloud_name: 'dodde1k6f', api_key: '222518759798153', api_secret: 'ybcSVckR32LhZEIYmNY9yHQctws', secure: true});

const upload = multer(); // no { storage: storage } since we are not using disk storage
const blogData = require(path.join(__dirname, 'blog-service.js')); // geting the blog-service.js file

//Setting up the handlebars engine
app.engine('.hbs', exphbs.engine({ extname: '.hbs',
   //Setting up helpers
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
app.set('view engine', '.hbs');

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({extended: true}))

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static('public')); // Line used for css

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


//Since there is no route for '/', I will just redirect the user to the about page
app.get('/', (req, res) => {
    res.redirect('/blog');
})
//Setting up a route for blog
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
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
        let categories = await blogData.getAllCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});
//Setting up a route for blog that will render a indivdual blog based on ID
app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
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
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getAllCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

// setup a route to listen on /about
app.get("/about", function (req, res) {
    res.render(path.join(__dirname + '/views/about.hbs'));//Using res.render to render the about.hbs page
});
// setting up a route for categories
app.get("/categories", (req, res) => {
    blogData.getAllCategories().then((data) => {
        res.render("categories", {categories: data});
    }).catch((err) => {
        res.render("posts",{message: "no results"});
    })
})


app.get("/posts", (req, res) => { 
    // creating custom query parameters (could just do req.query.category in the if statement, but for readability and understanding, I left it out)
    var category = req.query.category;
    var minDate = req.query.minDate;

    if(category){ // Was there a request to query category?
        blogData.getPostsByCategory(category).then((data) => {
            res.render("posts", {info: data});
        }).catch(function(err){
            res.render("posts", {message: "no results"});
        })
    }
    else if(minDate){ // query on dates
        blogData.getPostsByMinDate(minDate).then((data) => {
            res.render("posts", {info: data});
        }).catch(function(err){
            res.render("posts", {message: "no results"});
        })
    }
    else{
        blogData.getAllPosts().then((data) => {
            res.render("posts", {info:data});
        }).catch(function (err){
            res.render("posts", {message: "no results"});
        })
    }
    
});

// Setting up a route for addPost.html
app.get("/posts/add", function (req, res) {
    res.render('addPost');
//   res.render(path.join(__dirname + "/views/addPost.hbs")); //Rendering addPost.hbs
});

//Setting up aroute for /posts/:value, this must go after /posts/add
app.get("/posts/:value", (req, res) => {
  let value = req.params.value; //if using /posts/:value, variable name should probably be value, same with parameter (let value = req.params.value)
  blogData.getPostById(value).then(data =>
      res.json(data)).catch((err)=>res.json(err));
//     //Couldn't find a way to use render with this, as when I did it would display a empty result
//     //The code below was my attempt to use res.render
//     let value = req.params.value;
//     blogData.getPostById(value).then((data) =>{
//     res.render("posts", {info:data});
//  }).catch(function(err){
//     res.render("posts", {message: "no results"})
//  })

});


// Setting up a route to return 404. IMPORTANT: must GO BELOW all other routes
app.get("/*", function (req, res) { // Using a * to show that if none of the above routes are used, it will put any other route into a 404 error
    res.status(404).render(path.join(__dirname + '/views/404.hbs'));
});

// Setting up a POST route for /posts/add
//Post always comes after get
app.post('/posts/add', upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;
        blogData.addPost(req.body).then(() => {
            res.redirect("/posts");
        })
    }

})


// setup http server to listen on HTTP_PORT

// Attempted the methods below to bring in the exported initalize function, but had no luck as node was telling me that the module was not found
blogData.initialize().then((data) => {
    app.listen(HTTP_PORT, onHttpStart);
    console.log("Express http server listening on " + HTTP_PORT)
}).catch((err) => {
    console.error("Error starting server: " + err + " aborting startup");

});