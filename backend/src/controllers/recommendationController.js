/**
 * Recommendation Controller
 * Handles all CF-related endpoints
 */

const CollaborativeFilteringService = require("../services/collaborativeFiltering");
const EvaluationService = require("../services/evaluationService");

class RecommendationController {
  /**
   * Step 2: Get User-Item Matrix
   */
  static async getUserItemMatrix(req, res, next) {
    try {
      const matrix = await CollaborativeFilteringService.buildUserItemMatrix();
      res.json({
        success: true,
        step: 2,
        stepName: "Pembentukan Matriks User-Item",
        data: matrix,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Step 3: Calculate Similarity
   */
  static async getSimilarity(req, res, next) {
    try {
      const { userId } = req.params;
      const similarity = await CollaborativeFilteringService.calculateUserSimilarity(parseInt(userId));
      res.json({
        success: true,
        step: 3,
        stepName: "Perhitungan Cosine Similarity",
        data: similarity,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Step 4: Get Nearest Neighbors
   */
  static async getNearestNeighbors(req, res, next) {
    try {
      const { userId } = req.params;
      const k = req.query.k ? parseInt(req.query.k) : await CollaborativeFilteringService.getKValue();
      const neighbors = await CollaborativeFilteringService.findNearestNeighbors(parseInt(userId), k);
      res.json({
        success: true,
        step: 4,
        stepName: "Pemilihan Nearest Neighbors",
        data: neighbors,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Step 5: Predict Rating
   */
  static async getPrediction(req, res, next) {
    try {
      const { userId, guitarId } = req.params;

      // Validate inputs
      if (!userId || !guitarId) {
        return res.status(400).json({ success: false, message: "User ID and Guitar ID are required" });
      }

      const k = req.query.k ? parseInt(req.query.k) : await CollaborativeFilteringService.getKValue();
      const prediction = await CollaborativeFilteringService.predictRating(parseInt(userId), parseInt(guitarId), k);
      res.json({
        success: true,
        step: 5,
        stepName: "Prediksi Rating",
        data: prediction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Step 5: Predict All Unrated Items
   */
  static async getAllPredictions(req, res, next) {
    try {
      const { userId } = req.params;
      const k = req.query.k ? parseInt(req.query.k) : await CollaborativeFilteringService.getKValue();
      const predictions = await CollaborativeFilteringService.predictAllUnratedItems(parseInt(userId), k);
      res.json({
        success: true,
        step: 5,
        stepName: "Prediksi Semua Rating",
        data: predictions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Step 6: Get Recommendations
   */
  static async getRecommendations(req, res, next) {
    try {
      const userId = req.params.userId ? parseInt(req.params.userId) : req.user?.id;
      const k = req.query.k ? parseInt(req.query.k) : await CollaborativeFilteringService.getKValue();
      const topN = req.query.topN ? parseInt(req.query.topN) : 3;

      const recommendations = await CollaborativeFilteringService.generateRecommendations(userId, k, topN);
      res.json({
        success: true,
        step: 6,
        stepName: "Pemberian Rekomendasi",
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Step 7: Evaluate Performance
   */
  static async getEvaluation(req, res, next) {
    try {
      const k = req.query.k ? parseInt(req.query.k) : null;
      const evaluation = await EvaluationService.getEvaluationByUser(k);
      res.json({
        success: true,
        step: 7,
        stepName: "Evaluasi Performa",
        data: evaluation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get K configuration
   */
  static async getKConfig(req, res, next) {
    try {
      const k = await CollaborativeFilteringService.getKValue();
      res.json({
        success: true,
        data: { k },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set K configuration
   */
  static async setKConfig(req, res, next) {
    try {
      const { k } = req.body;
      if (!k || k < 1) {
        return res.status(400).json({
          success: false,
          message: "K harus berupa angka positif",
        });
      }
      await CollaborativeFilteringService.setKValue(k);
      res.json({
        success: true,
        message: `K berhasil diubah menjadi ${k}`,
        data: { k },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RecommendationController;
