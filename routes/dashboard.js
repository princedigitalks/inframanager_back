const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboardController");
const auth = require("../middleware/auth");

router.get("/stats", auth, dashboardController.getStats);

module.exports = router;
