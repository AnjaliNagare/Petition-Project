const path = require("path");
const express = require("express");
const cookieSession = require("cookie-session");

const { createSignature, getSignatures, getSignatureById } = require("./db");

const app = express();

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));

app.use(
    express.urlencoded({
        extended: false,
    })
);

const { SESSION_SECRET } = require("./secrets.json");
app.use(
    cookieSession({
        secret: SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14, // two weeks of cookie validity
        
    })
);

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

app.get("/", (request, response) => {
    console.log("GET /", request.session);

    if(request.session.signature_id){
        response.redirect("/thankyou");
        return;
    }
    response.render("homepage",{
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

app.listen(8081, () => console.log("Listening to http://localhost:8081"));