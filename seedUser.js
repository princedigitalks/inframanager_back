const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./model/User");
const CryptoJS = require("crypto-js");

dotenv.config();

const seedUser = async () => {
  try {
    await connectDB();
    
    const existingUser = await User.findOne({ email: "admin@gmail.com" });
    
    if (existingUser) {
      console.log("Admin user already exists ✅");
      process.exit();
    }

    const encryptedPassword = CryptoJS.AES.encrypt("123456", process.env.CRYPTO_SECRET).toString();

    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: encryptedPassword,
      phone: "1234567890",
      role: "staff",
      department: "Administration",
      designation: "Admin",
      status: "active"
    });

    console.log("Admin user created successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedUser();
