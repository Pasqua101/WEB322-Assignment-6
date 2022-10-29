const { resolveSoa } = require("dns");
const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
const { rootCertificates } = require("tls");

let posts = [];
let categories = [];

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
    if (posts.length == 0) {
      reject("no results returned");
    } else {
      resolve(posts);
    }
  });
};

function getPublishedPosts(){
  
  return new Promise((resolve, reject) => {
    var publish = posts.filter(post => post.published )
    if (publish.length === 0) { 
    reject("no results returned");
  }
  else {
    resolve(publish)
  }  
     
  });
};

function getAllCategories(){
    return new Promise((resolve, reject) => {
        if(categories.length){
            resolve(categories);
        }
        else{
            reject("No results returned");
        }
    })
};
function addPost(postData) {
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
function getPostsByMinDate(minDateStr){
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

function getPostById(id) {
    return new Promise((resolve,reject)=>{
       var postIds=[];
       var j=0;
        for(var i=0;i<posts.length;i++)
        {
            if(posts[i].id==id)
            {
              postIds[j++]=posts[i];
            }
        }

        if(postIds.length==0)
        {
        reject("no results returned");
        }   
        else
        {
          resolve(postIds[0]);
        } 
        
});

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
