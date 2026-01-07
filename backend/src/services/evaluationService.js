/**
 * Evaluation Service
 * Calculate MAE and RMSE for system performance evaluation
 */

const prisma = require("../config/database");
const { calculateMAE, calculateRMSE } = require("../utils/mathUtils");
const { predictRating, getKValue } = require("./collaborativeFiltering");

/**
 * Step 7: Evaluate System Performance
 * Using Leave-One-Out Cross Validation
 *
 * Process:
 * 1. For each rating in the database
 * 2. "Hide" that rating and predict it using CF
 * 3. Compare prediction with actual rating
 * 4. Calculate MAE and RMSE
 */
const evaluatePerformance = async (k = null) => {
  // Get K value from config if not provided
  if (k === null) {
    k = await getKValue();
  }

  // Get all ratings with their users and guitars
  const allRatings = await prisma.rating.findMany({
    include: {
      user: { select: { id: true, name: true } },
      guitar: { select: { id: true, name: true } },
    },
  });

  const evaluationResults = [];
  const actualValues = [];
  const predictedValues = [];

  for (const rating of allRatings) {
    try {
      // Predict the rating (using other users' data)
      const prediction = await predictRating(rating.userId, rating.guitarId, k);

      if (prediction.predictedRating !== null) {
        const actual = rating.averageRating;
        const predicted = prediction.predictedRating;
        const error = Math.abs(actual - predicted);

        evaluationResults.push({
          userId: rating.userId,
          userName: rating.user.name,
          guitarId: rating.guitarId,
          guitarName: rating.guitar.name,
          actualRating: actual,
          predictedRating: predicted,
          error: Math.round(error * 10000) / 10000,
          squaredError: Math.round(error * error * 10000) / 10000,
        });

        actualValues.push(actual);
        predictedValues.push(predicted);
      }
    } catch (error) {
      // Skip ratings that can't be predicted
      console.log(`Skipping rating for user ${rating.userId}, guitar ${rating.guitarId}`);
    }
  }

  // Calculate overall metrics
  const mae = calculateMAE(actualValues, predictedValues);
  const rmse = calculateRMSE(actualValues, predictedValues);

  // Interpretation
  let interpretation = "";
  if (mae < 0.5) {
    interpretation = "Sangat Baik - Prediksi sangat akurat";
  } else if (mae < 1.0) {
    interpretation = "Baik - Prediksi cukup akurat";
  } else if (mae < 1.5) {
    interpretation = "Cukup - Prediksi perlu perbaikan";
  } else {
    interpretation = "Kurang - Prediksi tidak akurat, perlu review algoritma";
  }

  return {
    k,
    totalRatings: allRatings.length,
    evaluatedRatings: evaluationResults.length,
    mae,
    rmse,
    interpretation,
    details: evaluationResults,
  };
};

/**
 * Get evaluation summary per user
 */
const getEvaluationByUser = async (k = null) => {
  const { details, mae, rmse, ...summary } = await evaluatePerformance(k);

  // Group by user
  const byUser = {};
  for (const result of details) {
    if (!byUser[result.userId]) {
      byUser[result.userId] = {
        userId: result.userId,
        userName: result.userName,
        ratings: [],
        totalError: 0,
      };
    }
    byUser[result.userId].ratings.push(result);
    byUser[result.userId].totalError += result.error;
  }

  // Calculate average error per user
  const userSummaries = Object.values(byUser).map((user) => ({
    ...user,
    averageError: Math.round((user.totalError / user.ratings.length) * 10000) / 10000,
    ratingsCount: user.ratings.length,
  }));

  return {
    ...summary,
    mae,
    rmse,
    userSummaries,
  };
};

module.exports = {
  evaluatePerformance,
  getEvaluationByUser,
};
