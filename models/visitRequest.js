const mongoose = require("mongoose");

const visitRequestSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, default: "I want to request a visit." },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Visit Scheduled", "Closed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

visitRequestSchema.index({ room: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("VisitRequest", visitRequestSchema);
