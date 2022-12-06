/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Marco Pasqua Student ID: 1000497213 Date: Tuesday, November 25th, 2022
*
*  Online (Heroku) Link: https://salty-hamlet-77009.herokuapp.com/ 
*
********************************************************************************/
//Required info from A5 from postgress
//Host: ec2-54-161-255-125.compute-1.amazonaws.com
//Database: d4jhdu2c5t5dof
//User:  yjnvyppfgdiflk
//Port: 5432
//Password: a51552b8cf33c388d71dc021f702198495ed4061bfb1c5d69a354a6252ab7a56
//URI: postgres://yjnvyppfgdiflk:a51552b8cf33c388d71dc021f702198495ed4061bfb1c5d69a354a6252ab7a56@ec2-54-161-255-125.compute-1.amazonaws.com:5432/d4jhdu2c5t5dof
//Heroku CLI: heroku pg:psql postgresql-horizontal-58002 --app salty-hamlet-77009


var express = require("express");
var app = express();
var path = require('path');
// Using path to find the location of the file so it can redirect the user to the html page
//Assignment 6 require auth-service.js
const authData = require(path.join(__dirname, "auth-service.js"));
const clientSessions = require("client-sessions");
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

app.use(express.urlencoded({extended: true}));

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
        },
        
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
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

//Middleware for A6
// Setup client-sessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});  
//Middleware for A6 ^

// This is a helper middleware function that checks if a user is logged in
// we can use it in any route that we want to protect against unauthenticated access.
// A more advanced version of this would include checks for authorization as well after
// checking if the user is authenticated
function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }

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

//Setting up routes for assignment 6
app.get('/login', function(req, res){
    console.log('Render login page');
    res.render('login');
});

app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){
    authData.registerUser(req.body).then(function(){
      res.render('register', {successMessage : "User created"});
    }).catch(function(err){
        res.render('register', {errorMessage : err, userName : req.body.userName});
    })

})

app.post('/login', function(req, res){
    req.body.userAgent = req.get('User-Agent');
    console.log('Inside login in post');
    authData.checkUser(req.body).then((user) =>{
        console.log('Inside checkUser.then()');
        req.session.user ={
            userName : user.userName,
            email : user.email,
            loginHistory : user.loginHistory
        }
        res.redirect('/posts');
    }).catch(function(err){
        console.log('Inside checkUser.catch()');
        res.render('login', {errorMessage: err, userName: req.body.userName});
    });
});

app.get('/logout', function(req, res){
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, function(req, res){
    res.render('userHistory');
});
//End of setting up routes for A6

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

app.get("/categories/add", ensureLogin, (req, res) =>{
    res.render("addCategory");
});

// setting up a route for categories
app.get("/categories", ensureLogin, (req, res) => {
    blogData.getAllCategories().then((data) => {
        if(data.length > 0){
            res.render("categories", {categories: data});
        }
        else{
            res.render("categories",{message: "no results"});    
        }
    }).catch((err) => {
        res.render("categories",{message: "no results"});
    })
});

//Setting up a rouet for /categories/delete/:id
app.get("/categories/delete/:id", ensureLogin, function (req, res){
    let id = req.params.id;
    blogData.deleteCategoryById(id).then(function() {
        res.redirect("/categories");
    }).catch(function(){
        res.status(500).send({message: "Unable to Remove Category / Category not found)"});
    });
});

// Setting up a route for addPost.html
app.get("/posts/add", ensureLogin, function (req, res) {

    blogData.getAllCategories().then(function(data){
        res.render("addPost", {categories: data});
    }).catch(function(){
        res.render("addPost", {categories:[]});
    })

});

app.get("/posts", ensureLogin, (req, res) => { 
    // creating custom query parameters (could just do req.query.category in the if statement, but for readability and understanding, I left it out)
    var category = req.query.category;
    var minDate = req.query.minDate;

    if(category){ // Was there a request to query category?
        blogData.getPostsByCategory(category).then(data => {
            if(data.length > 0){
                res.render("posts", {posts: data});
            }
            else{
                res.render("posts", {message: "no results"});
            }
        }).catch(function(err){
            res.render("posts", {message: "no results"});
        })
    }
    else if(minDate){ // query on dates
        blogData.getPostsByMinDate(minDate).then((data) => {
            if(data.length > 0){
                res.render("posts", {posts: data});
            }
            else{
                res.render("posts", {message: "no results"});
            }
        }).catch(function(err){
            res.render("posts", {message: "no results"});
        })
    }
    else{
        blogData.getAllPosts().then((data) => {
            if(data.length > 0){
                res.render("posts", {posts: data});
            }
            else{
                res.render("posts", {message: "no results"});
            }
        }).catch(function (err){
            res.render("posts", {message: "no results"});
        })
    }
    
    
});



//Setting up aroute for /posts/:value, this must go after /posts/add
app.get("/posts/:value", ensureLogin, (req, res) => {
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

app.get("/posts/delete/:id", ensureLogin, (req, res) =>{
    let id = req.params.id;
    console.log(id);
    blogData.deletePostById(id).then(function(){
        
        res.render("posts");
    }).catch(function(err){
        res.status(500).send({message : "Unable to Remove Post / Post not found)"});
    })
});


// Setting up a route to return 404. IMPORTANT: must GO BELOW all other routes
app.get("/*", function (req, res) { // Using a * to show that if none of the above routes are used, it will put any other route into a 404 error
    // res.status(404).render(path.join(__dirname + '/views/404.hbs'));
    res.status(404).render('404.hbs');
});

// Setting up a POST route for /posts/add
//Post always comes after get
app.post('/posts/add', ensureLogin, upload.single("featureImage"), (req, res) => {
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

});

app.post("/categories/add", ensureLogin, (req,res)=>{
    blogData.addCategory(req.body).then(()=>{
        res.redirect("/categories");
    }).catch(err=>{
        res.status(500).send(err);
    })
}); 


// setup http server to listen on HTTP_PORT

blogData.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
