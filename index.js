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
    getSignatureByCity,
    createUserProfile,
    getUserInfo,
    updateUser,
    upsertUserProfile,
    deleteSignature,
} = require("./db");

const { SESSION_SECRET } = require("./secrets.json");
const cookieSession = require("cookie-session");

app.use(express.static(path.join(__dirname, "public")));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use((request, response, next) => {
    response.setHeader("x-frame-options", "DENY");
    next();
});

app.use(
    cookieSession({
        secret: SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14, // two weeks of cookie validity
        sameSite: true,
    })
);

app.get("/", (request, response) => {
    console.log("GET /", request.session);

    if (!request.session.user_id) {
        response.redirect("/register");
        return;
    }
    if (request.session.signature_id) {
        response.redirect("/thankyou");
        return;
    }
    response.render("homepage");
});

app.post("/", (request, response) => {
    console.log("POST/", request.body, request.session);
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    if (!request.body.signature) {
        response.render("homepage", { error: "please fill all fields" });
        return;
    }
    createSignature({ ...request.body, user_id: request.session.user_id })
        .then((newSignature) => {
            console.log("POST/", newSignature);
            request.session.signature_id = newSignature.id;
            response.redirect("/thankyou");
        })
        .catch((error) => {
            console.log("POST /", error);
            response.redirect("/");
        });
});

app.get("/thankyou", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    if (!request.session.signature_id) {
        response.redirect("/");
        return;
    }
    getSignatureById(request.session.user_id).then((signature) => {
        response.render("thankyou", { signature });
    });
});

app.get("/signersList", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    if (!request.session.signature_id) {
        response.redirect("/");
        return;
    }
    getSignatures()
        .then((signersList) => {
            response.render("signersList", {
                signersList,
            });
        })
        .catch((error) => {
            console.log("error in signers", error);
        });
});

app.get("/signersList/:city", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    if (!request.session.signature_id) {
        response.redirect("/");
        return;
    }
    getSignatureByCity(request.params.city).then((signatures) => {
        response.render("signaturesByCity", {
            city: request.params.city,
            signatures,
        });
    });
});
app.get("/register", (request, response) => {
    if (request.session.user_id) {
        response.redirect("/thankyou");
        return;
    }
    response.render("register");
});

app.post("/register", (request, response) => {
    console.log("post /register", request.body);
    if (
        !request.body.first_name ||
        !request.body.last_name ||
        !request.body.email ||
        !request.body.password
    ) {
        response.render("register", {
            error: " Please fill all fields",
        });
        return;
    }
    createUser(request.body)
        .then((newUser) => {
            console.log("new user", newUser);
            request.session.user_id = newUser.id;
            response.redirect("/profile");
        })
        .catch((error) => {
            console.log("error creating user", error);
            if (error.constraint === "user_email_key") {
                response.status(400).render("register", {
                    error: "error registering User",
                });
                return;
            }
            response.status(500).render("register", {
                error: "Error registering user",
            });
        });
});

app.get("/login", (request, response) => {
    if (request.session.user_id) {
        response.redirect("/");
        return;
    }
    response.render("login");
});

app.post("/login", (request, response) => {
    console.log("post /login", request.body);

    login(request.body)
        .then((foundUser) => {
            request.session.user_id = foundUser.id;
            request.session.signature_id = foundUser.id;
            response.redirect("/thankyou");
        })
        .catch((error) => {
            console.log("error", error);
            response.status(500).render("register", {
                error: "Error logging user",
            });
        });
});

app.get("/profile", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    response.render("profile");
});

app.post("/profile", (request, response) => {
    console.log("post /profile", request.body);
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    createUserProfile({
        user_id: request.session.user_id,
        ...request.body,
    })
        .then(response.redirect("/"))
        .catch((error) => {
            console.log("error creating user profile", error);
            response.render("profile", {
                error: "please fill all the fields.",
            });
        });
});

app.get("/profile/edit", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    getUserInfo(request.session.user_id).then((userInfo) => {
        response.render("editProfile", {
            ...userInfo,
        });
    });
});

app.post("/profile/edit", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    console.log("request body", request.body);
    Promise.all([
        updateUser({
            user_id: request.session.user_id,
            ...request.body,
        }),
        upsertUserProfile({
            user_id: request.session.user_id,
            ...request.body,
        }),
    ])
        .then(() => {
            console.log("after updating profile");
            response.redirect("/");
        })
        .catch((error) => {
            console.log("error editing profile", error);
        });
});

app.post("/deletesignature", (request, response) => {
    deleteSignature(request.session.user_id)
        .then(() => {
            request.session.signature_id = null;
            response.redirect("/");
        })
        .catch((error) => {
            console.log("error deleting signature", error);
        });
});

app.post("/logout", (request, response) => {
    request.session = null;
    response.redirect("/login");
});

app.listen(8081, () => console.log("Listening on http://localhost:8081"));
