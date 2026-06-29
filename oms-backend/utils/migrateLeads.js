const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Lead = require("../models/Lead");

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/oms_database";
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    const result1 = await Lead.updateMany({ status: "Qualified" }, { status: "Meeting" });
    const result2 = await Lead.updateMany({ status: "Proposal Sent" }, { status: "Proposal" });
    const result3 = await Lead.updateMany({ status: "Won" }, { status: "Close" });
    const result4 = await Lead.updateMany({ status: "New" }, { status: "Contacted" });
    console.log(`Migration completed successfully.`);
    console.log(`Updated Qualified -> Meeting: ${result1.modifiedCount}`);
    console.log(`Updated Proposal Sent -> Proposal: ${result2.modifiedCount}`);
    console.log(`Updated Won -> Close: ${result3.modifiedCount}`);
    console.log(`Updated New -> Contacted: ${result4.modifiedCount}`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

migrate();
