const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const controller = require("../controllers/adminController");

// GET all logs (admin only)
router.get(
    "/worklogs", 
    auth, 
    role("admin"), 
    controller.getAllLogs
);

router.get(
    "/export", 
    auth, 
    role("admin"), 
    controller.exportLogs
);

router.post(
  "/create-user",
  auth,
  role("admin"),
  controller.createUser
);

router.put(
  "/reset-password/:employee_code",
  auth,
  role("admin"),
  controller.resetPassword
);

router.get(
  "/employees",
  auth,
  role("admin"),
  controller.getEmployees
);

router.delete(
  "/employee/:employee_code",
  auth,
  role("admin"),
  controller.deleteEmployee
);

module.exports = router;
