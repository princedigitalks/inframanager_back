const Server = require("../model/Server");
const Project = require("../model/Project");
const User = require("../model/User");
const Log = require("../model/Log");

exports.getStats = async (req, res) => {
  try {
    const totalServers = await Server.countDocuments();
    const activeServers = await Server.countDocuments({ status: "active" });
    const totalProjects = await Project.countDocuments();
    const runningProjects = await Project.countDocuments({ status: "running" });
    const totalUsers = await User.countDocuments();

    const projectsByTech = await Project.aggregate([
      { $group: { _id: "$technology", count: { $sum: 1 } } },
      { $project: { technology: "$_id", count: 1, _id: 0 } }
    ]);

    const projectsByServer = await Project.aggregate([
      { $group: { _id: "$server", count: { $sum: 1 } } },
      { $lookup: { from: "servers", localField: "_id", foreignField: "_id", as: "serverInfo" } },
      { $unwind: "$serverInfo" },
      { $project: { serverName: "$serverInfo.name", count: 1, _id: 0 } }
    ]);

    const recentLogs = await Log.find()
      .populate("user", "name")
      .limit(5)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        totalServers,
        activeServers,
        totalProjects,
        runningProjects,
        totalUsers,
        projectsByTech,
        projectsByServer,
        recentLogs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
