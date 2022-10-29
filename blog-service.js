const fs = require("fs"); //to use file system module
var path = require('path');

var posts = [];
var categories = [];

function initialize () {
    return new Promise((resolve, reject) => {
        // let message = "";
        fs.readFile(path.join(__dirname, "data/posts.json"), 'utf8', (err, data) => {
            if (err) {
                reject("Error occurred while loading Posts data");
            };
            posts = JSON.parse(data);
        });
        fs.readFile(path.join(__dirname, "data/categories.json"), 'utf8', (err, data) => {
            if (err) {
                reject("Error occurred while loading Categories data");
            }
            categories = JSON.parse(data);
        });

       resolve("Files read successfully");
    });
}
function getAllPosts() {
    return new Promise((resolve, reject) => {
        if(posts.length){
            resolve(posts);
        } 
        else{
            reject("No results returned");
        } 
    })
}


function getPublishedPosts(){
    return new Promise((resolve, reject) =>{
        const pubPosts = posts.filter((postsPub) =>{ 
            return postsPub.published === true;
        })

        if(pubPosts.length > 0){
            resolve(pubPosts);
        }
        else{
            reject("No results returned");
        }
    })
}

function getAllCategories(){
    return new Promise((resolve, reject) => {
        if(categories.length){
            resolve(categories);
        }
        else{
            reject("No results returned");
        }
    })
}
function addPost(postData){
  var day = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear();
  return new Promise(function(resolve,reject){
    
     
    try{

     postData.published=(postData.published)?true:false;
      postData.id = posts.length + 1;
      if(day <10 && month < 10){
            postData.postDate = year + "-" +  "0" + month + "-" + "0" + day;
        }else if(month <10){
            postData.postDate = year + "-" + "0" + month + "-" + day;
        }else if (day < 10){
            postData.postDate = year + "-"+ month + "-" + "0" + day;
        }else{
            postData.postDate = year + "-" + month + "-" + day;
        }
      posts.push(postData);
     resolve(postData);
    
  }catch(err){
    reject();
  }



});
}
function getPostsByCategory (category){
    return new Promise((resolve, reject) => {
        const categoryPosts = posts.filter((post) => {
            return post.category == category;
        })

        if(categoryPosts.length > 0){
            resolve(categoryPosts);
        }
        else{
            reject("no results returned");
        }
    })
}
function getPublishedPostsByCategory(category){
  return new Promise((resolve,reject)=>{
      if(posts.length > 0){
        let postsByCategory = posts.filter(post=>{ return post.published == true && post.category == category });
        if(postsByCategory.length > 0) {
          resolve(postsByCategory);
        } else {
          reject("no results returned");
        }
      }
  })
}

function getPostsByMinDate (minDateStr){
    return new Promise((resolve, reject) => {
        const minDatePosts = posts.filter((post) => {
            return new Date(post.postDate) >= new Date(minDateStr);
        })
        
        if(minDatePosts.length > 0){
            resolve(minDatePosts);
        }
        else{
            reject("no results returned");
        }
    })
}

function getPostById(id){
    return new Promise((resolve, reject) => {
        const getPostId = posts.filter((post) => {
            return post.id == id;
        })

        if(getPostId.length > 0){
            resolve(getPostId)
        }
        else{
            reject("no results returned");
        }
        // idPosts.length > 0 ? resolve(idPosts) : reject("no results returned");

        
    })
}
 

module.exports = {
    initialize,
    getAllPosts,
    getPublishedPosts,
    getAllCategories,
    addPost,
    getPostsByCategory,
    getPublishedPostsByCategory,
    getPostsByMinDate,
    getPostById
}
