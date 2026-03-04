var express = require("express");
var router = express.Router();

router.use("/health", require("./health"));
router.use("/user", require("./user"));
router.use("/server", require("./server"));
router.use("/project", require("./project"));
router.use("/log", require("./log"));
router.use("/dashboard", require("./dashboard"));

module.exports = router;
