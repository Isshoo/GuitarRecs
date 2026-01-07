/**
 * Guitar Routes
 */

const express = require("express");
const router = express.Router();
const guitarController = require("../controllers/guitarController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

// Public routes
router.get("/", guitarController.getAllGuitars);
router.get("/:id", guitarController.getGuitarById);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, guitarController.createGuitar);
router.put("/:id", authMiddleware, adminMiddleware, guitarController.updateGuitar);
router.delete("/:id", authMiddleware, adminMiddleware, guitarController.deleteGuitar);

// Unrated guitars route
router.get("/unrated/:userId", guitarController.getUnratedGuitarsByUser);

module.exports = router;
