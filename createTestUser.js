const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const User = require("./model/User");
const { encryptData } = require("./utils/crypto");
connectDB();

const createTestUser = async () => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: "admin@test.com" });
    
    if (existingUser) {
      console.log("User already exists!");
      console.log("Email: admin@test.com");
      console.log("Password: admin123");
      process.exit(0);
    }

    // Create new user
    const encryptedPassword = encryptData("admin123");
    
    const user = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: encryptedPassword,
      phone: "1234567890",
      role: "admin",
      department: "IT",
      designation: "Administrator",
      status: "active"
    });

    console.log("✅ Test user created successfully!");
    console.log("Email: admin@test.com");
    console.log("Password: admin123");
    console.log("User ID:", user._id);
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating user:", error.message);
    process.exit(1);
  }
};

createTestUser();
