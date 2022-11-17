const Sequelize = require('sequelize');   //library for database
//set up new connection to the postgres database  //var sequelize = new Sequelize('database', 'user', 'password', {});
var sequelize = new Sequelize('acdubutn','acdubutn','mUrVMbtgKjjaeSthK54IcVoVn1ff_EHY',{
    host:'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions:{
        ssl: { rejectUnauthorized: false }
    },
    query:{raw: true}
});

//create a TABLE called Post
var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

//create a TABLE called Category
var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, { foreignKey: 'category' });


module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {   //connect to the database set at the beginning
            resolve();   //resolve the promose later by .then() function in server.js
        }).catch(() => {   //if an error happens
            reject("Unable to sync the database");
        });
    });
};

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll().then(function (data) {
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
};

module.exports.getPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                category: category 
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
};

module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Post.findAll({
            where:{
                postDate: {
                    [gte]: new Date(minDateStr)
                }        
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
};

module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                id: id 
            }
        }).then(function(data){
            resolve(data[0]);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
};

module.exports.addPost = function(postData){
    return new Promise((resolve,reject)=>{
        postData.published = (postData.published) ? true : false;
        for(var d in postData){   //check each attribute in postData
            if(postData[d] == '') postData[d] = null;  //if any attribute is empty, set it to null before add it to the table Post
        }
        postData.postDate = new Date();
        Post.create(postData).then((posts)=>{  //add postData as a new record to the table Post
            resolve(posts);
        }).catch((err)=>{
            reject("unable to create post");
        })
    });
}

module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then(function (data) {
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
};

module.exports.getPublishedPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then(function (data) {
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
};

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll().then(function (data) {
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
};

module.exports.addCategory = function (categoryData) { 
    return new Promise(function (resolve, reject) {
        for (var d in categoryData) {   //check each attribute in postData
            if (categoryData[d] == '') categoryData[d] = null;    //if any attribute is empty, set it to null before add it to the table Category
        }
        Category.create(categoryData).then((category) => {   //add postData as a new record to the table Post
            resolve(category);
        }).catch((err) => {
            reject("Unable to create category");
        });
    });
};

module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        }).then(function (data) {
            resolve("destroyed");
        }).catch((err) => {
            reject("An error occurred while destroying");
        })
    });
};
module.exports.deletePostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        }).then(function (data) {
            resolve("destroyed");
        }).catch((err) => {
            reject("An error occurred while destroying");
        })
    });
};