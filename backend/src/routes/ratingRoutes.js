/**
 * Rating Routes
 */

const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

// Admin routes
router.get("/", authMiddleware, adminMiddleware, ratingController.getAllRatings);
router.get("/statistics", authMiddleware, adminMiddleware, ratingController.getRatingStatistics);

// User routes
router.get("/my-ratings", authMiddleware, ratingController.getRatingsByUser);
router.get("/guitar/:guitarId", authMiddleware, ratingController.getUserRatingForGuitar);
router.post("/", authMiddleware, ratingController.createOrUpdateRating);
router.delete("/:id", authMiddleware, ratingController.deleteRating);

// Admin - get ratings by specific user
router.get("/user/:userId", authMiddleware, adminMiddleware, ratingController.getRatingsByUser);

module.exports = router;
