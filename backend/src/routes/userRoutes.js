/**
 * User Routes (Admin only)
 */

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

// All routes require admin
router.use(authMiddleware, adminMiddleware);

router.get("/", userController.getAllUsers);
router.get("/pending-predictions", userController.getUsersWithPendingPredictions);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
