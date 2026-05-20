const express = require("express");
const router = express.Router();

const controller = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.put(
  "/change-password",
  auth,
  controller.changePassword
);

router.post("/login", controller.login);

module.exports = router;
