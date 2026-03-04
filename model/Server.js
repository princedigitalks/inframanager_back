const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ipAddress: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
  type: { type: String },
  username: { type: String, required: true },
  password: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Server", serverSchema);
