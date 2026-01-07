/**
 * Recommendation Routes
 * Endpoints for Collaborative Filtering process
 */

const express = require("express");
const router = express.Router();
const recController = require("../controllers/recommendationController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

// User routes - get own recommendations
router.get("/my-recommendations", authMiddleware, recController.getRecommendations);

// K configuration (Admin)
router.get("/config/k", authMiddleware, adminMiddleware, recController.getKConfig);
router.put("/config/k", authMiddleware, adminMiddleware, recController.setKConfig);

// Admin CF Process Routes (Steps 2-7)
// Step 2: User-Item Matrix
router.get("/matrix", authMiddleware, adminMiddleware, recController.getUserItemMatrix);

// Step 3: Similarity calculation
router.get("/similarity/:userId", authMiddleware, adminMiddleware, recController.getSimilarity);

// Step 4: Nearest Neighbors
router.get("/neighbors/:userId", authMiddleware, adminMiddleware, recController.getNearestNeighbors);

// Step 5: Prediction
router.get("/prediction/:userId/:guitarId", authMiddleware, adminMiddleware, recController.getPrediction);
router.get("/predictions/:userId", authMiddleware, adminMiddleware, recController.getAllPredictions);

// Step 6: Recommendations for specific user
router.get("/user/:userId", authMiddleware, adminMiddleware, recController.getRecommendations);

// Step 7: Evaluation
router.get("/evaluation", authMiddleware, adminMiddleware, recController.getEvaluation);

module.exports = router;
