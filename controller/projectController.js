const Project = require("../model/Project");
const Log = require("../model/Log");
const { encryptData, decryptData } = require("../utils/crypto");

const encryptFields = ['projectPath', 'nginxConfig', 'nginxContent', 'nginxDescription', 
  'adminPanel.port', 'adminPanel.envFile', 'adminPanel.envContent', 'adminPanel.envDescription', 'adminPanel.pm2Name', 'adminPanel.pm2Description',
  'backend.port', 'backend.envFile', 'backend.envContent', 'backend.envDescription', 'backend.pm2Name', 'backend.pm2Description',
  'website.port', 'website.envFile', 'website.envContent', 'website.envDescription', 'website.pm2Name', 'website.pm2Description'
];

exports.createProject = async (req, res) => {
  try {
    const projectData = { ...req.body };
    encryptFields.forEach(field => {
      const keys = field.split('.');
      if (keys.length === 2) {
        if (projectData[keys[0]] && projectData[keys[0]][keys[1]] != null && projectData[keys[0]][keys[1]] !== '') {
          projectData[keys[0]][keys[1]] = encryptData(String(projectData[keys[0]][keys[1]]));
        }
      } else {
        if (projectData[field] != null && projectData[field] !== '') {
          projectData[field] = encryptData(String(projectData[field]));
        }
      }
    });
    const project = await Project.create(projectData);
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
      { "adminPanel.domain": { $regex: search, $options: "i" } },
      { "backend.domain": { $regex: search, $options: "i" } },
      { "website.domain": { $regex: search, $options: "i" } }
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
    const projectData = project.toObject();
    encryptFields.forEach(field => {
      const keys = field.split('.');
      if (keys.length === 2) {
        if (projectData[keys[0]] && projectData[keys[0]][keys[1]]) {
          projectData[keys[0]][keys[1]] = decryptData(projectData[keys[0]][keys[1]]);
        }
      } else {
        if (projectData[field]) projectData[field] = decryptData(projectData[field]);
      }
    });
    res.json({ success: true, data: projectData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const updateData = { ...req.body };
    encryptFields.forEach(field => {
      const keys = field.split('.');
      if (keys.length === 2) {
        if (updateData[keys[0]] && updateData[keys[0]][keys[1]] != null && updateData[keys[0]][keys[1]] !== '') {
          updateData[keys[0]][keys[1]] = encryptData(String(updateData[keys[0]][keys[1]]));
        }
      } else {
        if (updateData[field] != null && updateData[field] !== '') {
          updateData[field] = encryptData(String(updateData[field]));
        }
      }
    });
    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
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

exports.decryptProjectData = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const decryptedData = {};
    encryptFields.forEach(field => {
      const keys = field.split('.');
      if (keys.length === 2) {
        if (project[keys[0]] && project[keys[0]][keys[1]]) {
          if (!decryptedData[keys[0]]) decryptedData[keys[0]] = {};
          decryptedData[keys[0]][keys[1]] = decryptData(project[keys[0]][keys[1]]);
        }
      } else {
        if (project[field]) decryptedData[field] = decryptData(project[field]);
      }
    });
    res.json({ success: true, data: decryptedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
