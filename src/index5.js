const express = require("express");
const passport = require("passport");
const session = require("express-session");
const app = express();
const path = require("path");

// Require your authentication strategy setup
require("./auth");

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../templates"));

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Session setup
const sessionSecretKey = "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";
app.use(session({
    secret: sessionSecretKey
}));

// Custom middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}
app.get("/",(req,res)=>{
    res.render("authentication")
})


app.get("/google/callback",(req,res)=>{
    app.get("/param/home",(req,res)=>{

        res.render("home")
    })
    res.redirect("/param/home")
})

// Route to handle authentication
app.post("/authentication", passport.authenticate("local", {
    successRedirect: "/protected",
    failureRedirect: "/auth/failure"
}));

// Route to render login form
app.get("/", (req, res) => {
    res.render("login");
});

// Route to handle protected content
app.get("/protected", isLoggedIn, (req, res) => {
    res.send("You are logged in!");
});

// Route to handle Google authentication
app.get("/auth/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
