/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Marco Pasqua Student ID: 1000497213 Date: Tuseday, October 4th, 2022
*
*  Online (Heroku) Link: ________________________________________________________
*
********************************************************************************/ 


var express = require("express");
var app = express();
var path = require('path'); //Using path to find the location of the file so it can redirect the user to the html page

//Importing Json files
var  departments = require('./data/departments.json');
var employees = require('./data/employees.json');

// import dataService from './data-service.js'

// const dataService = require(path.join(__dirname,'data-service.js'));
// const dataService = require('./data-service.js');
const dataService = require(path.join(__dirname, 'data-service.js'));

//Importing data-service.js file
// var dataService = require('./data-service.js');

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static('public')); //Line used for css
// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    
    res.sendFile(path.join(__dirname+'/views/home.html')); //Will redirect user to the html page
    
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname+'/views/about.html'));
    // res.send("Success");
});

// setting up a route for employees
app.get("/employees", function(req, res){
  // res.send(employees); //Returning the employees.json file to the user
  dataService.getAllEmployees().then((data) =>{
    res.json(data);
  })
  .catch((err) =>{
    console.error("Error retrieveing departments: " + err);
    res.json({message: err});
  })
  
});

//Setting up a route for managers
app.get("/managers", function(req,res){
  
  // let arrOfManagers = []; //Using literal notation to declare an array of Managers
  
  //   for(let i = 0; i < employees.length; i++){
  //     if(employees[i].isManager === true){ //Check to see which employees are manager
  //       arrOfManagers.push(employees[i]); //If a employee is a mamanger, the push that employee to arrOfManagers
  //     }
  //   }
  //   res.send(arrOfManagers); //Return arrOfManagers to the user
  
  dataService.getManagers().then((data) =>{
    res.json(data);
  })
  .catch((err) =>{
    console.error("Error retrieveing managers: " + err);
    res.json({message: err});
  })
  
});

//Setting up a route for departments, that will show all departments in the JSON
app.get("/departments", function(req,res){
  dataService.getDepartments().then((data) =>{
    res.json(data);
  })
  .catch((err) =>{
    console.error("Error retrieveing departments: " + err);
    res.json({message: err});
  })

});

//Setting up a route to return 404
app.get("/*", function(req,res){ //Using a * to show that if none of the above routes are used, it will put any other route into a 404 error
  res.status(404).send("Page Not Found");
});

// setup http server to listen on HTTP_PORT

//Attempted the methods below to bring in the exported initalize function, but had no luck as node was telling me that the module was not found
dataService.initialize().then((data) => {
  app.listen(HTTP_PORT, onHttpStart);
  console.log("Express http server listening on " + HTTP_PORT)
}).catch((err) => {
  console.error("Error starting server: " + err + " aborting startup");
  
});

