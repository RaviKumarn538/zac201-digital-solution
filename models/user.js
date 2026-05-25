const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "admin", "owner"],
      default: "student",
    },
    name: { type: String, required: true },
    phone: String,
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    gender: String,
    occupation: String,
    institute: String,
    preferredArea: String,
    budgetRange: String,
    foodRequired: String,
    roomType: String,
    safetyPriority: String,
    specialRequirements: String,
    preferencesComplete: { type: Boolean, default: false },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
