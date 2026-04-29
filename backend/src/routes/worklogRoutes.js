const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/worklogController");

router.post("/", auth, controller.createLog);
router.put("/:id", auth, controller.updateLog);

module.exports = router;
