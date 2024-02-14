const express = require("express");
const app = express();
const path = require("path");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const fs = require('fs').promises;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public")); // Serve static files (e.g., images)
app.use(
  session({
    secret: "your-secret-key", // Change this to a secret key for session encryption
    resave: false,
    saveUninitialized: true,
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../templates"));

const url = "mongodb://0.0.0.0:27017";
const dbName = "blogify";

// Multer storage setup
const storage = multer.memoryStorage(); // Store images in memory (you can configure it to store on disk if needed)
const upload = multer({ storage: storage });

// Middleware to check if the user is authenticated
const checkAuth = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  res.redirect("/login"); // Redirect to login if not authenticated
};

app.get("/login", (req, res) => {
  res.render("log-in");
});

app.get("/home", checkAuth, (req, res) => {
  res.render("home");
});

app.get("/signup", (req, res) => {
  res.render("sign-in");
});

app.post("/login", async (req, res) => {
  let client; // Declare client in a broader scope

  try {
    const email = req.body.useremail;
    client = new MongoClient(url, { useUnifiedTopology: true });
  
    await client.connect();
    const dbname = client.db("paramshah");
    const collection = dbname.collection("paramdata");
    
    const verify = await collection.findOne({ email: email });

    if (!verify) {
      res.end("no user found");
    } else if (verify.password === req.body.loginuserpassword) {
      // Set the session variable to mark the user as authenticated
      req.session.isAuthenticated = true;
      res.redirect("/home");
    } else {
      res.end("incorrect details");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.post("/signup", (req, res) => {
  let client; // Declare client in a broader scope
  let collection; // Declare collection in a broader scope

  const data = {
    email: req.body.useremail,
    password: req.body.userpassword,
  };

  new MongoClient(url, { useUnifiedTopology: true })
    .connect()
    .then((connectedClient) => {
      client = connectedClient;
      const dbname = client.db("paramshah");
      collection = dbname.collection("paramdata");

      // Check if the user with the provided email already exists
      return collection.findOne({ email: data.email });
    })
    .then((existingUser) => {
      if (existingUser) {
        res.end("User with this email already exists");
      } else {
        // User does not exist, proceed with creating a new user
        return collection.insertOne(data);
      }
    })
    .then(() => {
      // Set the session variable to mark the user as authenticated after signup
      req.session.isAuthenticated = true;
      res.redirect("/home");

      // Sending email part
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'param270604@gmail.com',
          pass: 'pmli gtxp xctm ppzj',
        }
      });

      const mailOptions = {
        from: 'param270604@gmail.com',
        to: req.body.useremail,
        subject: 'Signup Successful',
        text: `Thank you for signing up!\n\nYour email: ${data.email}\nYour password: ${data.password}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    })
    .finally(() => {
      if (client) {
        client.close();
      }
    });
});

// Route to handle image uploads and store URLs in MongoDB
app.post("/storeimages", checkAuth, upload.array("images"), (req, res) => {
  let client; // Declare client in a broader scope

  new MongoClient(url, { useUnifiedTopology: true })
    .connect()
    .then((connectedClient) => {
      client = connectedClient;
      const db = client.db(dbName);
      const collection = db.collection("images_collection");

      const images = req.files;

      if (!images || images.length === 0) {
        return res.status(400).send("No images uploaded.");
      }

      const imagePromises = images.map(async (image, i) => {
        const imageBuffer = image.buffer;

        if (!imageBuffer) {
          return res.status(400).send(`Image buffer is undefined for image ${i + 1}.`);
        }

        // Save the image file to the "uploads" folder
        const imageName = `image_${Date.now()}_${i}.${image.mimetype.split('/')[1]}`;
        const imagePath = path.join(__dirname, 'uploads', imageName);

        // Ensure the "uploads" folder exists
        await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });

        // Convert the imageBuffer to a Buffer
        const buffer = Buffer.from(imageBuffer);

        // Write the Buffer to the file
        await fs.writeFile(imagePath, buffer);

        // Save the image file path to MongoDB
        await collection.insertOne({ imagePath: imagePath });
      });

      return Promise.all(imagePromises);
    })
    .then(() => {
      res.status(200).send("Images uploaded successfully!");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    })
    .finally(() => {
      if (client) {
        client.close();
      }
    });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
