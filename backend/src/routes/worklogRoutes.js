const express = require("express");
const router = express.Router();

const controller = require("../controllers/worklogController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, controller.createLog);

router.get("/my", auth, controller.getMyWorklogs);

router.get("/today", auth, controller.getTodayWorklog);

router.put("/:id", auth, controller.updateLog);

module.exports = router;