const {where} = require('sequelize');
const Sequelize = require('sequelize');
var sequelize = new Sequelize('ltciogix', 'ltciogix', 'J5HzqNbuqCJ34x9x8fUVMG5AAg4kDRSM', {
    host: 'peanut.db.elephantsql.com',
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

  body : Sequelize.TEXT,
  title : Sequelize.STRING,
  postDate : Sequelize.DATE,
  featureImage : Sequelize.STRING,
  published : Sequelize.BOOLEAN
  
});

var Category = sequelize.define('Category', {
  category : Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(() => {
      resolve("Data synced successfully");
    }).catch(() => {
      reject("Unable to sync with database");
    });
    
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll().then(function(data){
      resolve(data);
    }).catch(function(){
      reject("no results returned");
    })
  });
};

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where :{
        published : true
      }
    }).then(function(data){
      resolve(data);
    }).catch(function(data){
      reject("no results returned");
    })
  });
};

function getAllCategories() {
  return new Promise((resolve, reject) => {
    Category.findAll().then(function(data){
      resolve(data);
    }).catch(function(){
      reject("no results returned");
    })
  });

};
function addPost(postData) {
  return new Promise((resolve, reject) => {
    postData.published = (postData.published) ? true : false;
    for(let i in postData){
      if(postData[i] == ''){//Check to see if any fields are empty, if yes set the field to null
          postData[i] = null;
      }
    }
    postData.postDate = new Date();
    Post.create(postData).then(function(data){
      resolve(data);
    }).catch(function(){
      reject("unabale to create post");
    })
  });
}

function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where :{
        category : category //NOTE: category on the left is the one in the table. One of the right is passed in
      }
  }).then(function(data){
    resolve(data);
  }).catch(function(){
    reject("no results returned");
  })
  });
};

function getPublishedPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where :{
        category : category, //Category on the left is from the table, one on the right is the parameter
        published : true
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
      where :{
        postDate : {
          [gte]: new Date(minDateStr)  //gte is a built in sequalize operator, was defined on line 105, and will return dates greater than or equal to minDatStr
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
    Post.findAll({
      where:{
        id : id
      }
    }).then(function(data){
      resolve(data[0]);
    }).catch(function(){
      reject("no results returned");
    })
  });
}



function addCategory(categoryData){
  return new Promise((resolve, reject) => {
    for(let i in categoryData){
      if(categoryData[i] === ''){
        categoryData[i] = null;
      }
    }
    Category.create(categoryData).then(function(data){
      resolve(data);
    }).catch(function(){
      reject("unable to create category")
    })
  });

};

function deleteCategoryById(id){
  return new Promise((resolve, reject) => {
    Category.destroy({
      where :{
        id : id
      }
    }).then(function(){
      resolve("Removed category");
    }).catch(function(){
      reject("Unable to Remove Category / Category not found)");
    })
  });
}


function deletePostById(id){
  return new Promise((resolve, reject) => {
    Post.destroy({
      where :{
        id : id
      }
    }).then(function(){
      resolve("Removed post");
    }).catch(function(){
      reject("Unable to Remove Post / Post not found)");
    })
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
    getPostById,
    addCategory,
    deleteCategoryById,
    deletePostById
}
