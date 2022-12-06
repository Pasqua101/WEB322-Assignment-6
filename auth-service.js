const bcrypt = require('bcryptjs');

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = new Schema({
  "userName":  {
        "type" : String,
        "unique" : true
  },
  "password": String,
  "email": String,
  "loginHistory": [{
    "dateTime": Date,
    "userAgent": String
  }]
});

var User = mongoose.model("users", userSchema);

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://Pasqua_101:web322_mongoDB@senecaweb.i6g6ca3.mongodb.net/?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

// module.exports.registerUser = function(userData){
//     return new Promise(function (resolve, reject){
//         if(userData.password == userData.password2){
//             let newUser = new User(userData);
//             newUser.save(function(err){
//                 if(err){
//                     if(err.code === 11000){
//                         reject("User Name already taken");
//                     }
//                     else{
//                         reject("There was an error creating the user: ", err);
//                     }
//                 }
//                 else{
//                     resolve();
//                 }
//             })
//         }
//         else{
//             reject("Passwords do not match");
//         }
//     })
// };
//^ Without encryption

module.exports.registerUser = (userData) =>
  new Promise(async (resolve, reject) => {
    const { password, password2 } = userData;
    if (password !== password2) {
      reject("Passwords do not match");
    }

    bcrypt
      .genSalt(10)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hash) => {
        userData.password = hash;
        let newUser = new User(userData);

        newUser
          .save()
          .then(() => resolve())
          .catch((err) => {
            if (err.code === 11000) {
              reject();
            } else {
              reject("There was an error creating the user: " + err);
            }
          });
      })
      .catch(() => {
        reject("There was an error encrypting the password");
      });
  });

// module.exports.checkUser = function(userData){
//     return new Promise(function (resolve, reject){
//         console.log(userData);
//         User.find({userName : userData.userName}).exec().then((users) => {
//             console.log("Inside User.find");
//             if(users.length === 0){
//                 console.log('User length is 0');
//                 reject("Unable to find user:" + userData.userName)
//             }
//             else{
//                 if(users[0].password != userData.password){
//                     console.log('User password is incorrect');
//                     reject("Incorrect Password for user: " + userData.userName);
//                 }
//                 else{
//                     console.log('Updating login history');
//                     users[0].loginHistory.push({
//                         dateTime : (new Date()).toString(),
//                         userAgent : userData.userAgent
//                     });
//                     console.log("Doing User.updateOne");
//                     User.updateOne(
//                         {userName : users[0].userName},
//                         {$set : { loginHistory : users[0].loginHistory}}
//                         ).exec().then(function(){
//                             resolve(users[0]);
//                         }).catch(function(err){
//                             console.log('failed to verify user');
//                             reject("There was an error verifying the user: " + err);
//                         })
//                 }
//             }
//         }).catch(function(){
//             console.log("Couldn't find user");
//             reject("Unable to find user: " + userData.userName);
//         });
//     })
// }

module.exports.checkUser = (userData) =>
  new Promise(async (resolve, reject) => {
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        if (users.length === 0) {
          reject("Unable to find user: " + userData.userName);
        } else {
          bcrypt
            .compare(userData.password, users[0].password)
            .then((result) => {
              if (result === false) {
                reject("Incorrect Password for user: " + userData.userName);
              }
            });
          users[0].loginHistory.push({
            dateTime: new Date().toString(),
            userAgent: userData.userAgent,
          });

          User.updateOne(
            {
              userName: users[0].userName,
            },
            {
              $set: {
                loginHistory: users[0].loginHistory,
              },
            }
          )
            .exec()
            .then(() => {
              resolve(users[0]);
            })
            .catch((err) =>
              reject("There was an error verifying the user: " + err)
            );
        }
      })
      .catch(() => {
        reject("Unable to find user: " + userData.userName);
      });
  });