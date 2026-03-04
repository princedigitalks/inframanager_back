const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const User = require("./model/User");
const { decryptData } = require("./utils/crypto");
connectDB();

const testLogin = async () => {
  try {
    const email = process.argv[2] || "admin@test.com";
    const password = process.argv[3] || "admin123";

    console.log(`\nTesting login for: ${email}`);
    console.log(`With password: ${password}\n`);

    const user = await User.findOne({ email, status: "active" });
    
    if (!user) {
      console.log("❌ User not found or inactive");
      process.exit(1);
    }

    console.log("✅ User found in database");
    console.log("User ID:", user._id);
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Status:", user.status);
    console.log("Encrypted Password:", user.password);

    const decryptedPassword = decryptData(user.password);
    console.log("Decrypted Password:", decryptedPassword);

    if (decryptedPassword === password) {
      console.log("\n✅ Password matches! Login should work.");
    } else {
      console.log("\n❌ Password does NOT match!");
      console.log("Expected:", password);
      console.log("Got:", decryptedPassword);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

testLogin();
