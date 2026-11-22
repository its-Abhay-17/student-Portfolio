require("dotenv").config();
const mongoose = require("mongoose");
const data = require("../models/data");
const { service } = require("../models/contact");

// Cache the connection across requests in the same serverless instance
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { promise: null };

async function connect() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
  });
  console.log("Connected to MongoDB Atlas");

  // Seed only if the collection is empty
  const count = await service.countDocuments();
  if (count === 0) {
    await service.insertMany(data);
    console.log("Services inserted successfully!");
  }
}

async function connectDB() {
  if (!cached.promise) {
    cached.promise = connect().catch((err) => {
      cached.promise = null; // allow retry on the next request
      throw err;
    });
  }
  return cached.promise;
}

module.exports = connectDB;