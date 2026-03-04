const Project = require("../model/Project");
const Log = require("../model/Log");

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    if (req.user && req.user.id) {
      await Log.create({
        action: "CREATE_PROJECT",
        details: `Created project: ${project.name}`,
        user: req.user.id,
        resourceType: "project",
        resourceId: project._id
      }).catch(err => console.error('Log creation failed:', err));
    }
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { domain: { $regex: search, $options: "i" } }
    ];

    const projects = await Project.find(query)
      .populate("server", "name ipAddress")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("server");
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("server");
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    if (req.user && req.user.id) {
      await Log.create({
        action: "UPDATE_PROJECT",
        details: `Updated project: ${project.name}`,
        user: req.user.id,
        resourceType: "project",
        resourceId: project._id
      }).catch(err => console.error('Log creation failed:', err));
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    if (req.user && req.user.id) {
      await Log.create({
        action: "DELETE_PROJECT",
        details: `Deleted project: ${project.name}`,
        user: req.user.id,
        resourceType: "project",
        resourceId: project._id
      }).catch(err => console.error('Log creation failed:', err));
    }
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
