/**
 * Math Utilities for Collaborative Filtering
 */

/**
 * Calculate Cosine Similarity between two vectors
 * @param {number[]} vectorA - First vector
 * @param {number[]} vectorB - Second vector
 * @returns {number} Cosine similarity value (0-1)
 */
const cosineSimilarity = (vectorA, vectorB) => {
  if (vectorA.length !== vectorB.length || vectorA.length === 0) {
    return 0;
  }

  // Calculate dot product (A · B)
  let dotProduct = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }

  // Calculate magnitudes
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // Avoid division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Cosine similarity formula
  const similarity = dotProduct / (magnitudeA * magnitudeB);

  // Round to 4 decimal places
  return Math.round(similarity * 10000) / 10000;
};

/**
 * Calculate Mean Absolute Error (MAE)
 * @param {number[]} actual - Actual values
 * @param {number[]} predicted - Predicted values
 * @returns {number} MAE value
 */
const calculateMAE = (actual, predicted) => {
  if (actual.length !== predicted.length || actual.length === 0) {
    return 0;
  }

  let sumError = 0;
  for (let i = 0; i < actual.length; i++) {
    sumError += Math.abs(actual[i] - predicted[i]);
  }

  return Math.round((sumError / actual.length) * 10000) / 10000;
};

/**
 * Calculate Root Mean Squared Error (RMSE)
 * @param {number[]} actual - Actual values
 * @param {number[]} predicted - Predicted values
 * @returns {number} RMSE value
 */
const calculateRMSE = (actual, predicted) => {
  if (actual.length !== predicted.length || actual.length === 0) {
    return 0;
  }

  let sumSquaredError = 0;
  for (let i = 0; i < actual.length; i++) {
    const error = actual[i] - predicted[i];
    sumSquaredError += error * error;
  }

  return Math.round(Math.sqrt(sumSquaredError / actual.length) * 10000) / 10000;
};

/**
 * Calculate average of an array
 * @param {number[]} arr - Array of numbers
 * @returns {number} Average value
 */
const average = (arr) => {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / arr.length) * 100) / 100;
};

module.exports = {
  cosineSimilarity,
  calculateMAE,
  calculateRMSE,
  average,
};
