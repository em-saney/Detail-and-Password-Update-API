const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

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

// Endpoint to change user password
app.put('/change_password/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { currentPassword, newPassword } = req.body;

    // Fetch the user from the MongoDB collection
    const user = await client.db(dbName).collection(collectionName).findOne({ _id: ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current password matches
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the MongoDB collection
    const result = await client.db(dbName).collection(collectionName).updateOne(
      { _id: ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    // Check if the update was successful
    if (result.matchedCount > 0) {
      res.status(200).json({ message: 'Password changed successfully' });
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
