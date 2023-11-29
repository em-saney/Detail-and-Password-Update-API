const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB configuration
const mongoUri = 'your_mongo_uri';
const dbName = 'your_database_name';
const collectionName = 'your_collection_name';

// Middleware to parse JSON in requests
app.use(express.json());

// Connect to MongoDB
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();

// Endpoint to update user details
app.put('/update_user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = req.body;

    // Update the user in the MongoDB collection
    const result = await client.db(dbName).collection(collectionName).updateOne(
      { _id: ObjectId(userId) },
      {
        $set: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        },
      }
    );

    // Check if the update was successful
    if (result.matchedCount > 0) {
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
