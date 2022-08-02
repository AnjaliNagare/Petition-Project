// const { getCities, getCityByName } = require("./db");

// getCities().then((cities) => {
//     console.log(cities);
// });

// getCityByName("SELECT * FROM cities WHERE name = 'Berlin'");
// const { createUser } = require("./db.js");
// createUser({
//     first_name: "yo",
//     last_name: "yo",
//     email: "yo@yo.com",
//     password: "yo",
// })
//     .then((newUser) => {
//         console.log("newUser", newUser);
//     })
//     .catch((error) => {
//         console.log("error creating user", error);
//     });

// const { response } = require("express");
// const { login } = require("./db.js");

// login ({
//     email: "yo@yo.com",
//     password: "yo",
// }).then((foundUser) => {
//     console.log(foundUser);
//     if(foundUser){
//         response.redirect('/');
//         return;
//     }
//     response.render("login", {
//         error: 'Wrong Credentials'
//     });
// });