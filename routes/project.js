const express = require("express");
const router = express.Router();
const projectController = require("../controller/projectController");
const auth = require("../middleware/auth");

router.post("/", auth, projectController.createProject);
router.get("/", auth, projectController.getProjects);
router.get("/:id", auth, projectController.getProjectById);
router.get("/:id/decrypt", auth, projectController.decryptProjectData);
router.put("/:id", auth, projectController.updateProject);
router.delete("/:id", auth, projectController.deleteProject);

module.exports = router;
