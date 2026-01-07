/**
 * Recommendation Controller
 * Handles all CF-related endpoints
 */

const cfService = require("../services/collaborativeFiltering");
const evalService = require("../services/evaluationService");

/**
 * Step 2: Get User-Item Matrix
 */
const getUserItemMatrix = async (req, res, next) => {
  try {
    const matrix = await cfService.buildUserItemMatrix();
    res.json({
      success: true,
      step: 2,
      stepName: "Pembentukan Matriks User-Item",
      data: matrix,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 3: Calculate Similarity
 */
const getSimilarity = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const similarity = await cfService.calculateUserSimilarity(parseInt(userId));
    res.json({
      success: true,
      step: 3,
      stepName: "Perhitungan Cosine Similarity",
      data: similarity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 4: Get Nearest Neighbors
 */
const getNearestNeighbors = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const k = req.query.k ? parseInt(req.query.k) : await cfService.getKValue();
    const neighbors = await cfService.findNearestNeighbors(parseInt(userId), k);
    res.json({
      success: true,
      step: 4,
      stepName: "Pemilihan Nearest Neighbors",
      data: neighbors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 5: Predict Rating
 */
const getPrediction = async (req, res, next) => {
  try {
    const { userId, guitarId } = req.params;

    // Validate inputs
    if (!userId || !guitarId) {
      return res.status(400).json({ success: false, message: "User ID and Guitar ID are required" });
    }

    const k = req.query.k ? parseInt(req.query.k) : await cfService.getKValue();
    const prediction = await cfService.predictRating(parseInt(userId), parseInt(guitarId), k);
    res.json({
      success: true,
      step: 5,
      stepName: "Prediksi Rating",
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 5: Predict All Unrated Items
 */
const getAllPredictions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const k = req.query.k ? parseInt(req.query.k) : await cfService.getKValue();
    const predictions = await cfService.predictAllUnratedItems(parseInt(userId), k);
    res.json({
      success: true,
      step: 5,
      stepName: "Prediksi Semua Rating",
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 6: Get Recommendations
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId) : req.user?.id;
    const k = req.query.k ? parseInt(req.query.k) : await cfService.getKValue();
    const topN = req.query.topN ? parseInt(req.query.topN) : 3;

    const recommendations = await cfService.generateRecommendations(userId, k, topN);
    res.json({
      success: true,
      step: 6,
      stepName: "Pemberian Rekomendasi",
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 7: Evaluate Performance
 */
const getEvaluation = async (req, res, next) => {
  try {
    const k = req.query.k ? parseInt(req.query.k) : null;
    const evaluation = await evalService.getEvaluationByUser(k);
    res.json({
      success: true,
      step: 7,
      stepName: "Evaluasi Performa",
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get K configuration
 */
const getKConfig = async (req, res, next) => {
  try {
    const k = await cfService.getKValue();
    res.json({
      success: true,
      data: { k },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set K configuration
 */
const setKConfig = async (req, res, next) => {
  try {
    const { k } = req.body;
    if (!k || k < 1) {
      return res.status(400).json({
        success: false,
        message: "K harus berupa angka positif",
      });
    }
    await cfService.setKValue(k);
    res.json({
      success: true,
      message: `K berhasil diubah menjadi ${k}`,
      data: { k },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserItemMatrix,
  getSimilarity,
  getNearestNeighbors,
  getPrediction,
  getAllPredictions,
  getRecommendations,
  getEvaluation,
  getKConfig,
  setKConfig,
};
