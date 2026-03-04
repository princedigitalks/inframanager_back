const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resourceType: { type: String, enum: ["server", "project", "user"], required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: true });

module.exports = mongoose.model("Log", logSchema);
