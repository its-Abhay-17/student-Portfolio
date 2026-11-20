require("dotenv").config();
const mongoose = require("mongoose");
const data = require("../models/data");
const { service } = require("../models/contact");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    // Optional: Only insert initial services if the collection is empty
    const count = await service.countDocuments();
    if (count === 0) {
      await service.insertMany(data);
      console.log("6 services inserted successfully!");
    }
  } catch (error) {
    console.error("Database connection or seeding error:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
