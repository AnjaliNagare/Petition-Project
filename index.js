const path = require("path");
const express = require("express");
const app = express();

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

const {
    createSignature,
    getSignatures,
    getSignatureById,
    createUser,
    login,
} = require("./db");

const { SESSION_SECRET } = require("./secrets.json");
const cookieSession = require("cookie-session");

app.use(express.static(path.join(__dirname, "public")));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14, // two weeks of cookie validity
        sameSite: true,
    })
);


app.get("/", (request, response) => {
    console.log("GET /", request.session);

    if (request.session.signature_id) {
        response.redirect("/signersList");
        return;
    }
    response.render("homepage");
});

app.post("/", (request, response) => {
    console.log("POST/", request.body);
    if(
        !request.body.first_name ||
        !request.body.last_name ||
        !request.body.signature
    ){
        response.render("homepage", {
            error:" please fill all fields",
            
        });
        return;
    }
    createSignature(request.body)
        .then((newSignature) => {
            request.session.signature_id = newSignature.id;
            console.log("POST /signatures", newSignature);
            response.redirect("/thankyou");
        })
        .catch((error) => {
            console.log("POST /signatures", error);
            response.redirect("/");
        });
        
});

app.get("/thankyou", (request, response)=>{
    if(!request.session.signature_id) {
        response.redirect("/");
        return;
    }
    getSignatureById(request.session.signature_id).then(() => {
        response.render("thankyou");
    });
});
 

app.get("/signersList", (request, response) => {
    if(!request.session.signature_id) {
        response.redirect("/");
        return;
    }
    getSignatures().then((signersList) => {
        response.render("signersList", {
            signersList,
        });
    });
});

app.get('/register',(request,response) => {
    response.render("register");
});

app.post('/register', (request, response) => {
    console.log("post /register", request.body);
    if(
        !request.body.first_name ||
        !request.body.last_name ||
        !request.body.email ||
        !request.body.password
    ){
        response.render("register", {
            error: " please fill all fields",
        });
        return;
    }
    createUser(request.body) 
        .then((newUser) => {
            console.log("new user", newUser);
            request.session.user_id = newUser.id;
            response.redirect("/");
        })
        .catch((error) => {
            console.log("error creating user", error);
            response.status(500).render("register", {
                error: "Error registering user",
            });
        });
});

app.get("/login", (request, response) => {
    response.render("login");
});

app.post("/login", (request,response) => {
    console.log("post /login", request.body);
    login(request.body)
        .then((foundUser) => {
            if(!foundUser) {
                response.render("login", {
                    error: 'Login failed, please Try again.'
                });
                return;
            }    
            request.session.user_id = foundUser.id;
            response.redirect("/");
        })
        .catch((error) => {
            console.log("error", error);
            response.status(500).render("register", {
                error: "Error logging user",
            });
        });
    
});

// app.get("/profile", (request, response) => {
//     response.render("profile");
// });

// app.post("/profile", (request, response) => {
//     console.log("post /profile", request.body);
// });

app.listen(8081, () => console.log("Listening to http://localhost:8081"));