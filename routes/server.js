const express = require("express");
const router = express.Router();
const serverController = require("../controller/serverController");
const auth = require("../middleware/auth");

router.post("/", auth, serverController.createServer);
router.get("/", auth, serverController.getServers);
router.get("/:id", auth, serverController.getServerById);
router.get("/:id/decrypt", auth, serverController.decryptCredentials);
router.put("/:id", auth, serverController.updateServer);
router.delete("/:id", auth, serverController.deleteServer);

module.exports = router;
