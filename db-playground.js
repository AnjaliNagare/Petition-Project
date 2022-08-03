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

// 
const { createUser, login } = require("./db.js");

createUser({
    first_name: 'yo',
    last_name: 'yo',
    email: 'yo@yo.com',
    password: 'yo',
})
    .then((newUser) => {
        console.log('newUser', newUser);
    })
    .catch((error) => {
        console.log('error creating user', error);
    });

login ({
    email: "yo@yo.com",
    password: "yoo",
}).then((foundUser) => {
    console.log(foundUser);
    
});