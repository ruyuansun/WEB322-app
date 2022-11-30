const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let Schema = mongoose.Schema;
//create the userschema table
let userSchema = new Schema({ 
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{ //create a login history array
        dataTime: Date,
        userAgent: String
    }]
});

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://ruyuansun:Your Highness715@senecaweb.l4mrpz9.mongodb.net/web322_week8");
        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password != userData.password2) { //confirm the password and confirming password is the same
            reject("Passwords do not match");
        }
        else { //set the length of the key to 10
            bcrypt.hash(userData.password, 10).then(hash => {
                userData.password = hash;   //save the encrypted password that the user inputs in the online form
                let newUser = new User(userData);   //create an instance of User
                newUser.save((err) => {
                    if (err) {
                        if (err.code == 11000) {
                            reject("User Name already taken");
                        }
                        else {
                            reject("There was an error creating the user: " + err);
                        }
                    }
                    else {
                        resolve();
                    }
                });
            }).catch((err) => {
                reject("There was an error encrypting the password");
            });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName }) //search from the mongodb for the username, make sure the username exists
            .exec()
            .then((users) => {
                if (users.length == 0) {
                    reject("Unable to find user: " + userData.userName);
                }
                else {  //compare() decrypts the password saved in database, and compares it with the user-input password
                    bcrypt.compare(userData.password, users[0].password).then((result) => { //cannot use === to compare because the password is encrypted
                        if (result === true) { //if the two passwords match
                            //before resolve, update the user's login history
                            users[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                            User.updateOne({ userName: users[0].userName },
                                { $set: { loginHistory: users[0].loginHistory } }
                            ).exec()
                                .then(() => {
                                    resolve(users[0]);
                                })
                                .catch((err) => {
                                    reject("There was an error verifying the user: " + err)
                                });
                        }
                        else {
                            reject("Invorrect Password for user: " + userData.userName);
                        }
                    });
                }
            });
    });
};