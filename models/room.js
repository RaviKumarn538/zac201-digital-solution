const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    area: { type: String, required: true },
    landmark: { type: String, required: true },
    rent: { type: Number, required: true },
    deposit: { type: Number, required: true },
    roomType: { type: String, required: true },
    category: { type: String, enum: ["Boys", "Girls"], required: true },
    food: { type: String, enum: ["Yes", "No"], required: true },
    foodDetails: String,
    facilities: [String],
    nearbyPlaces: [String],
    rules: [String],
    utilities: String,
    availability: {
      type: String,
      enum: ["Available", "Few beds left", "Full"],
      default: "Available",
    },
    ownerName: { type: String, default: "" },
    ownerContact: { type: String, required: true },
    ownerAddress: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    auditStatus: {
      type: String,
      enum: ["Admin Added", "Pending Zac Audit", "Zac Verified", "Needs Owner Follow-up", "Rejected"],
      default: "Admin Added",
    },
    submissionSource: {
      type: String,
      enum: ["Admin", "Partner Submission"],
      default: "Admin",
    },
    published: { type: Boolean, default: true },
    videoUrl: String,
    photos: [String],
    safetyNotes: String,
    distanceNotes: String,
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
