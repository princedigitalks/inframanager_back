const User = require("../model/User");
const Log = require("../model/Log");
const jwt = require("jsonwebtoken");
const { encryptData, decryptData } = require("../utils/crypto");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, status: "active" });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const decryptedPassword = decryptData(user.password);
    if (String(decryptedPassword) !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, department, designation } = req.body;

    const encryptedPassword = encryptData(password);

    const user = await User.create({
      name,
      email,
      password: encryptedPassword,
      phone,
      department,
      designation,
      role: "staff",
    });

    if (req.user && req.user.id) {
      await Log.create({
        action: "CREATE_USER",
        details: `Created user: ${user.name}`,
        user: req.user.id,
        resourceType: "user",
        resourceId: user._id
      }).catch(err => console.error('Log creation failed:', err));
    }

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search)
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, department, designation, password } = req.body;

    const updateData = { name, email, phone, department, designation };

    if (password) {
      updateData.password = encryptData(password);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (req.user && req.user.id) {
      await Log.create({
        action: "UPDATE_USER",
        details: `Updated user: ${user.name}`,
        user: req.user.id,
        resourceType: "user",
        resourceId: user._id
      }).catch(err => console.error('Log creation failed:', err));
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (req.user && req.user.id) {
      await Log.create({
        action: "DELETE_USER",
        details: `Deleted user: ${user.name}`,
        user: req.user.id,
        resourceType: "user",
        resourceId: user._id
      }).catch(err => console.error('Log creation failed:', err));
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (req.user && req.user.id) {
      await Log.create({
        action: "UPDATE_USER_STATUS",
        details: `Changed user status to ${status}: ${user.name}`,
        user: req.user.id,
        resourceType: "user",
        resourceId: user._id
      }).catch(err => console.error('Log creation failed:', err));
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
