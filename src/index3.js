const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");

const url = "mongodb://0.0.0.0:27017";
const dbName = "blogify";
const collectionName = "images_collection";

// Your other setup and middleware code...

app.get("/getimages/:email", async (req, res) => {
  const userEmail = req.params.email;

  const client = new MongoClient(url, { useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Use contains query to find images for the specified email
    const images = await collection.find({ email: { $regex: userEmail } }).toArray();

    // Respond with the images
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

// Your other routes and app.listen...

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
