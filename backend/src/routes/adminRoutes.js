const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const controller = require("../controllers/adminController");

// GET all logs (admin only)
router.get("/worklogs", auth, role("admin"), controller.getAllLogs);
router.get("/export", auth, role("admin"), controller.exportLogs);
module.exports = router;
