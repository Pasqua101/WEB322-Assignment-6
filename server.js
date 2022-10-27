/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Marco Pasqua Student ID: 1000497213 Date: Tuseday, October 4th, 2022
*
*  Online (Heroku) Link: https://morning-badlands-90535.herokuapp.com/
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
app.use(express.urlencoded({extended: true}))
// Setting up cloudinary to get what it needs
cloudinary.config({cloud_name: 'dodde1k6f', api_key: '222518759798153', api_secret: 'ybcSVckR32LhZEIYmNY9yHQctws', secure: true});

const upload = multer(); // no { storage: storage } since we are not using disk storage
const service = require(path.join(__dirname, 'blog-service.js')); // geting the blog-service.js file

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({extended: true}))

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static('public')); // Line used for css

//Since there is no route for '/', I will just redirect the user to teh about page
app.get('/', (req, res) => {
    res.redirect('/about');
})
//Setting up a route for blog
app.get('/blog', (req, res) => {
    service.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch((err) =>{
        res.json({message: err});
    })
})

// setup a route to listen on /about
app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname + '/views/about.html'));
    // res.send("Success");
});
// setting up a route for categories
app.get("/categories", (req, res) => {
    service.getAllCategories().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({message: err});
    })
})

// Setting up a route for /posts
app.get("/posts", (req, res) => { // creating custom query parameters (could just do req.query.category in the if statement, but for readability and understanding, I left it out)
    var category = req.query.category;
    var minDate = req.query.minDate;

    if (category) { // Was there a request to query category?
        service.getPostsByCategory(category).then(data => res.send(data)).catch(err => res.json({message: err}));
    } 
    else if (minDate) { // query on dates
        service.getPostsByMinDate(minDate).then(data => res.send(data)).catch(err => res.json({message: err}));
    } 
    else {
        service.getAllPosts().then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({message: err});
        })
    }

    
});

// Setting up a route for addPost.html
app.get("/posts/add", function (req, res) {
  res.sendFile(path.join(__dirname + "/views/addPost.html")); // Sending html file to the user so they can view it
});

//Settinf up aroute for /posts/:value, this must go after /posts/add
app.get("/posts/:value", (req, res) => {
  let value = req.params.value; //if using /posts/:value, variable name should probably be value, same with parameter (let value = req.params.value)
  service.getPostById(value).then(data =>
      res.json(data)).catch((err)=>res.json(err));
});


// Setting up a route to return 404. IMPORTANT: must GO BELOW all other routes
app.get("/*", function (req, res) { // Using a * to show that if none of the above routes are used, it will put any other route into a 404 error
    res.status(404).send("Page Not Found");
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
        service.addPost(req.body).then(() => {
            res.redirect("/posts");
        })
    }

})


// setup http server to listen on HTTP_PORT

// Attempted the methods below to bring in the exported initalize function, but had no luck as node was telling me that the module was not found
service.initialize().then((data) => {
    app.listen(HTTP_PORT, onHttpStart);
    console.log("Express http server listening on " + HTTP_PORT)
}).catch((err) => {
    console.error("Error starting server: " + err + " aborting startup");

});
