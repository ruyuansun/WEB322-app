const fs = require("fs");   
var posts = [];
var categories = [];

module.exports.initialize = function () {   
    return new Promise((resolve, reject) => { 
        fs.readFile('./data/posts.json', (err, data) => {   //open and attempt to read the file
            if (err) {  
                reject("unable to posts.json");    //reject(err) catches and prints the error message in the terminal
            }
            else {     //if no error
                posts = JSON.parse(data);   //JSON.parse(data) parses the data from json format to JavaScript
                resolve();
            }
        });
        fs.readFile('./data/categories.json', (err, data) => {   //open and attempt to read the file
            if (err) {  
                reject("unable to read categories.json");    //reject(err) catches and prints the error message in the terminal
            }
            else {     //if no error
                categories = JSON.parse(data);   //JSON.parse(data) parses the data from json format to JavaScript
                resolve();
            }
        });
    });
}

module.exports.getAllPosts = function () { 
    return new Promise((resolve, reject) => {
        //check the size of the 'posts' array
        if (posts.length == 0) {    //if the 'posts' array is still empty after the above function reads the file, the file is empty
            reject("no posts returned");
        }
        else {  
            resolve(posts);  
        }
    });
}

module.exports.getPublishedPosts = function () { 
    return new Promise((resolve, reject) => {
        var filteredPosts = [];   //create a temp array to store the elements filtered out of the 'posts' array
        for (let i = 0; i < posts.length; i++){
            if (posts[i].published == true) {  
                //use push to add an element to the end of an array; use unshift to add an element at the beginning of an array
                filteredPosts.push(posts[i]);
            }
        }

        if (filteredPosts.length == 0) {
            reject("no published posts returned");
        }
        else { 
            resolve(filteredPosts);
        }
    });
}

module.exports.getCategories = function () { 
    return new Promise((resolve, reject) => {
        //check the size of the 'posts' array
        if (categories.length == 0) {    //if the 'posts' array is still empty after the above function reads the file, the file is empty
            reject("no categories returned");
        }
        else {  
            resolve(categories);  
        }
    });
}

module.exports.addBlog = function (postData) {
    return new Promise(function (resolve, reject) {
        postData.published = (postData.published) ? true : false;   //If the user click the checkbox in the web form, save true; else, save false
        postData.id = posts.length + 1;   
        posts.push(postData);
        resolve();
    });
};

module.exports.getPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        var postsInCategory = [];
        posts.forEach((element) => {
            if (element.category == category) {
                postsInCategory.push(element);
            }
        });

        if (postsInCategory.length == 0) {
            reject("no posts in the category " + category + " returned");
        }
        else {
            resolve(postsInCategory);
        }
    });
};

module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        var postsInTimeRange = [];
        posts.forEach((element) => {
            if (new Date(element.postDate) >= new Date(minDateStr)) {
                postsInTimeRange.push(element);
            }
        });

        if (postsInTimeRange.length == 0) {
            reject("no posts on or after the day " + minDateStr + " returned");
        }
        else {
            resolve(postsInTimeRange);
        }
    });
};

module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        let found = false;
        for (var i = 0; i < posts.length; i++) { 
            if (posts[i].id == id) {
                found = true;
                break;
            }
        }
        if (!found) { 
            reject("no posts with ID " + id + " returned");
        }
        else {
            resolve(posts[i]);
        }
    });
};
