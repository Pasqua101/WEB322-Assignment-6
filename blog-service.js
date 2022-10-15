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

function addPost(postData){

    return new Promise((resolve, reject) => {
        if(posts){
            if(postData.publish === undefined){ 
                postData.published = false;
            }
            else{
                postData.published = true;
            }
            
            postData.id = posts.length + 1;
            posts.push(postData);
            resolve(postData);
        }
        else{
            console.log("Post unavailable");
            reject();
        }
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

module.exports = {
    initialize,
    addPost,
    getAllPosts,
    getAllCategories,
    getPostsByCategory,
    getPostsByMinDate,
    getPostById,
    getPublishedPosts
}