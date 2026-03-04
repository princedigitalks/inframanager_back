const Server = require("../model/Server");
const Log = require("../model/Log");
const { encryptData, decryptData } = require("../utils/crypto");

exports.createServer = async (req, res) => {
  try {
    const { username, password, ...rest } = req.body;
    const serverData = {
      ...rest,
      username: encryptData(username),
      password: encryptData(password)
    };
    const server = await Server.create(serverData);
    if (req.user && req.user.id) {
      await Log.create({
        action: "CREATE_SERVER",
        details: `Created server: ${server.name}`,
        user: req.user.id,
        resourceType: "server",
        resourceId: server._id
      }).catch(err => console.error('Log creation failed:', err));
    }
    res.status(201).json({ success: true, data: server });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getServers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { ipAddress: { $regex: search, $options: "i" } }
    ];

    const servers = await Server.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Server.countDocuments(query);

    res.json({
      success: true,
      data: servers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getServerById = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ success: false, message: "Server not found" });
    }
    const serverData = server.toObject();
    serverData.username = decryptData(serverData.username);
    serverData.password = decryptData(serverData.password);
    res.json({ success: true, data: serverData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateServer = async (req, res) => {
  try {
    const { username, password, ...rest } = req.body;
    const updateData = { ...rest };
    if (username) updateData.username = encryptData(username);
    if (password) updateData.password = encryptData(password);
    
    const server = await Server.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!server) {
      return res.status(404).json({ success: false, message: "Server not found" });
    }
    if (req.user && req.user.id) {
      await Log.create({
        action: "UPDATE_SERVER",
        details: `Updated server: ${server.name}`,
        user: req.user.id,
        resourceType: "server",
        resourceId: server._id
      }).catch(err => console.error('Log creation failed:', err));
    }
    res.json({ success: true, data: server });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteServer = async (req, res) => {
  try {
    const server = await Server.findByIdAndDelete(req.params.id);
    if (!server) {
      return res.status(404).json({ success: false, message: "Server not found" });
    }
    if (req.user && req.user.id) {
      await Log.create({
        action: "DELETE_SERVER",
        details: `Deleted server: ${server.name}`,
        user: req.user.id,
        resourceType: "server",
        resourceId: server._id
      }).catch(err => console.error('Log creation failed:', err));
    }
    res.json({ success: true, message: "Server deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
