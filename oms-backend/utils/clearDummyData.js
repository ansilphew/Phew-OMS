const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Lead = require("../models/Lead");

async function clearDummy() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/oms_database";
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    // Clear activities and todos arrays
    const result = await Lead.updateMany({}, { activities: [], todos: [] });
    console.log(`Successfully cleared dummy data on ${result.modifiedCount} leads.`);
  } catch (error) {
    console.error("Clearing failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

clearDummy();
