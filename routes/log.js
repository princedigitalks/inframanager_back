const express = require("express");
const router = express.Router();
const logController = require("../controller/logController");
const auth = require("../middleware/auth");

router.post("/", auth, logController.createLog);
router.get("/", auth, logController.getLogs);

module.exports = router;
