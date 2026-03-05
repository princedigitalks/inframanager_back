const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true },
  server: { type: mongoose.Schema.Types.ObjectId, ref: "Server", required: true },
  technology: { type: String },
  port: { type: String },
  status: { type: String, enum: ["running", "stopped", "maintenance"], default: "running" },
  description: { type: String },
  projectPath: { type: String },
  nginxConfig: { type: String },
  nginxContent: { type: String },
  nginxDescription: { type: String },
  envFile: { type: String },
  envContent: { type: String },
  envDescription: { type: String },
  pm2Name: { type: String },
  pm2Description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
