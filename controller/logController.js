const Log = require("../model/Log");

exports.createLog = async (req, res) => {
  try {
    const log = await Log.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, resourceType } = req.query;
    const query = {};
    if (resourceType) query.resourceType = resourceType;

    const logs = await Log.find(query)
      .populate("user", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Log.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
