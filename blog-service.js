const {where} = require('sequelize');
const Sequelize = require('sequelize');
var sequelize = new Sequelize('d4jhdu2c5t5dof', 'yjnvyppfgdiflk', 'a51552b8cf33c388d71dc021f702198495ed4061bfb1c5d69a354a6252ab7a56', {
    host: 'ec2-54-161-255-125.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    query: {
        raw: true
    }
});


var Post = sequelize.define('Post', {

  postid: { //Had to define my own ID as I was unable to do something like Post.id : id in getPostById()
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
  category : {
    categoryid: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
    
  },
  category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

function initialize() {
    return new Promise((resolve, reject) => {

        sequelize.sync().then(function () {

            resolve("Successfully synced database");

        }).catch(function () {
            reject("Unable to sync database");
        })


    });

}

function getAllPosts() {
    return new Promise((resolve, reject) => {

        Post.findall().then(function (data) {
            resolve(data);
        }).catch(function () {
            reject("no results returned");
        });
    });

};

function getPublishedPosts() {

    return new Promise((resolve, reject) => {
      Post.findAll({
        where:{
        published: true
        }
      }).then(function (data){
        resolve(data);
      }).catch(function (){
        reject("no results returned")
      })

      
    });

};

function getAllCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll(

        ).then(function(data){
          resolve(data);
        }).catch(function(){
          reject("no results returned");
        })
    });

};
function addPost(postData) {
    return new Promise((resolve, reject) => {
      postData.published = (postData.published) ? true : false; //First making sure that the published property is set correctly
      //Ensuring all empty attributes are set to null
      for(let prop in postData){
        if(postData[prop] === ""){
          postData[prop] = null;
        }
      }
      postData = new Date();

      Post.create({
        postid: postData.postid,
        title: postData.title,
        postDate: postData.postDate,
        featureImage: postData.featureImage,
        published: postData.published,
        category: postData.category 
      })
      .then(function(data){
        resolve(data);
      }).catch(function(){
        reject("unable to create post");
      });
    });

}

function getPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        Post.findall({ // attributes: ['category'], //NOTE: Not necessary to use this line of code, since there is only 1 field in the table. Leaving it as an example for another way to do it. Or as a way to do a more specific query that returns 1 field
            where: { // NOTE: category on left is the category field in the category table. Value on the right is the value passed in as a parameter
                category: category
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function (data) {
            reject("no results returned");
        });
    });
};

function getPublishedPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        
      Post.findAll({
        where : {
          published : true,
          category : category //Value on the left is category in the Post table, one on the right is the value passed into the table
        }
      }).then(function(data){
        resolve(data);
      }).catch(function(){
        reject("no results returned");
      })
    });

}
function getPostsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {

        const {gte} = Sequelize.Op; //NOTE: gte stands for greater than or equal to. According to https://sequelize.org/v5/manual/querying.html

        Post.findAll({
            where: {
                postDate: {
                  //Looks for dates that are greater than or eqaul to the date passed in from minDateStr
                    [gte]: new Date(minDateStr) //gte is a built in sequalize operator, was defined on line 105, and will return dates greater than or equal to minDatStr
                }
            }
        }).then(function(data){
          resolve(data);
        }).catch(function(){
          reject("no results returned");
        })
    });

}

function getPostById(id) {
    return new Promise((resolve, reject) => {
      Post.findall({
        where: {
          postid : id
        }
          
      }).then(function(data){
          resolve(data[0]); //Returning the first object
      }).catch(function(){
        reject("no results returned");
      });
    });

}

function addCategory(categoryData){
  return new Promise(function (resolve, reject){
    for(let cat in categoryData){
      if(categoryData[cat] === ""){
        categoryData[cat] = null;
      }
    };
    Category.create({
        //Should autoincrement the id
        category: categoryData.category
    }).then(() =>{
      resolve("adding category was a success");
    }).catch(() => {
      reject("Unable to create category");
    });
  })
  
}

function deleteCategoryById(id){
  return new Promise(function (resolve, reject){
    Category.destory({
      where: { 
        categoryid : id
      }
    }).then(()=>{
      resolve("Category # " + id + " has been deleted");
    }).catch(()=>{
      reject("Unable to delete category # " + id);
    })
  })
}

function deletePostById(id){
  return new Promise(function (resolve, reject){
    Post.destory({
      where: {
        postid : id
      }
    }).then(()=>{
      resolve("Post # " + id + " has been deleted");
    }).catch(()=>{
      reject("Unable to delete post # " + id);
    })
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
    getPostById,
    addCategory,
    deleteCategoryById,
    deletePostById
}
