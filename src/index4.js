const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const session = require("express-session");
const path = require("path");

// Connection URL and Database Name
const url = "mongodb://0.0.0.0:27017";
const dbName = "session_user"; // Change the database name as needed

// Middleware to set up views
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Middleware to serve static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // Middleware to parse POST request body
app.get("/login", (req, res) => {
    res.render("login");
});

const userData = {};

app.post("/login", (req, res) => {
    const url = "mongodb://0.0.0.0:27017";
    const client = new MongoClient(url);
    
    client.connect()
    .then(() => {
        const dbname = client.db("session_data");
        const username = req.body.username;
        userData.user = username; // Store the username in the userData object
        const collection = dbname.collection("usernames");
        
        return collection.findOne({ name: username });
    })
    .then(result => {
        const username = req.body.username;
        if (result) {
            app.get(`/${username}/home`, (req, res) => {
                res.render("home");
            });
            res.redirect(`/${username}/home`);
        } else {
            res.end("User not found");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        res.end("Error occurred");
    })
    .finally(() => {
        client.close();
    });
});

app.post("/home", async (req, res) => {
    const email = req.body.usernumber;
    const username = userData.user;
    const url = "mongodb://0.0.0.0:27017";
    const client = new MongoClient(url);
    
    client.connect()
    .then(() => {
        const dbname = client.db("session_data");
        const collection = dbname.collection("usernames");
        return collection.updateOne(
            { name: username }, // Use the 'username' variable here instead of 'param'
            { $set: { email: email } } // Use the 'email' variable here instead of 'req.body.usernumber'
            );
        })
        .then(() => {
            res.end("Data inserted");
        })
        .catch(error => {
            console.error("Error:", error);
            res.end("Error occurred");
        })
        .finally(() => {
            client.close();
        });
    });

    
    const number={}
    app.post("/hariya",(req,res)=>{
        const a=9;
        number.no=a;
    })
    
app.post("/chachaji",(req,res)=>{
    const mehta=number.no;
    console.log(mehta)
})
app.listen(3000)
