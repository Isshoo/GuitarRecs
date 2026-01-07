/**
 * Collaborative Filtering Service
 * User-Based Collaborative Filtering with Cosine Similarity
 */

const prisma = require("../config/database");
const { cosineSimilarity, average } = require("../utils/mathUtils");

/**
 * Step 2: Build User-Item Matrix
 * Creates a matrix where rows are users and columns are guitars
 * Values are average ratings
 */
const buildUserItemMatrix = async () => {
  const ratings = await prisma.rating.findMany({
    include: {
      user: { select: { id: true, name: true } },
      guitar: { select: { id: true, name: true } },
    },
    orderBy: [{ user: { name: "asc" } }, { guitar: { name: "asc" } }],
  });

  const users = await prisma.user.findMany({
    where: { role: "user" },
    orderBy: { name: "asc" },
  });

  const guitars = await prisma.guitar.findMany({
    orderBy: { name: "asc" },
  });

  // Build the matrix
  const matrix = {};
  users.forEach((user) => {
    matrix[user.id] = {
      userId: user.id,
      userName: user.name,
      ratings: {},
    };
    guitars.forEach((guitar) => {
      matrix[user.id].ratings[guitar.id] = null;
    });
  });

  // Fill in the ratings
  ratings.forEach((rating) => {
    if (matrix[rating.userId]) {
      matrix[rating.userId].ratings[rating.guitarId] = rating.averageRating;
    }
  });

  return {
    users: users.map((u) => ({ id: u.id, name: u.name })),
    guitars: guitars.map((g) => ({ id: g.id, name: g.name })),
    matrix: users.map((user) => matrix[user.id]),
  };
};

/**
 * Step 3: Calculate Similarity between users
 * Uses Cosine Similarity on common rated items
 */
const calculateUserSimilarity = async (targetUserId) => {
  const { users, guitars, matrix } = await buildUserItemMatrix();

  const targetUser = matrix.find((m) => m.userId === targetUserId);
  if (!targetUser) {
    return null; // Return null instead of throwing error
  }

  // Get guitar IDs that target user has rated
  const targetRatedGuitars = Object.entries(targetUser.ratings)
    .filter(([_, rating]) => rating !== null)
    .map(([guitarId, _]) => parseInt(guitarId));

  if (targetRatedGuitars.length === 0) {
    return { targetUser, similarities: [], commonGuitars: [] };
  }

  const similarities = [];

  for (const otherUser of matrix) {
    if (otherUser.userId === targetUserId) continue;

    // Find common rated guitars
    const commonGuitars = targetRatedGuitars.filter((guitarId) => otherUser.ratings[guitarId] !== null);

    if (commonGuitars.length === 0) continue;

    // Build vectors from common ratings
    const targetVector = commonGuitars.map((gId) => targetUser.ratings[gId]);
    const otherVector = commonGuitars.map((gId) => otherUser.ratings[gId]);

    const similarity = cosineSimilarity(targetVector, otherVector);

    similarities.push({
      userId: otherUser.userId,
      userName: otherUser.userName,
      similarity,
      commonGuitars: commonGuitars.length,
      targetVector,
      otherVector,
    });
  }

  // Sort by similarity descending
  similarities.sort((a, b) => b.similarity - a.similarity);

  return {
    targetUser: {
      userId: targetUser.userId,
      userName: targetUser.userName,
      ratedGuitars: targetRatedGuitars,
    },
    similarities,
    commonGuitars: targetRatedGuitars,
  };
};

/**
 * Step 4: Find Nearest Neighbors
 * Select top K users with highest similarity
 */
const findNearestNeighbors = async (targetUserId, k = 3) => {
  const result = await calculateUserSimilarity(targetUserId);

  if (!result) return null;

  const { targetUser, similarities } = result;

  // Get K nearest neighbors
  const neighbors = similarities.slice(0, k);

  return {
    targetUser,
    k,
    neighbors,
    totalCandidates: similarities.length,
  };
};

/**
 * Step 5: Predict Rating for unrated items
 * Uses weighted average of neighbors' ratings
 */
const predictRating = async (targetUserId, guitarId, k = 3) => {
  const neighborsResult = await findNearestNeighbors(targetUserId, k);

  if (!neighborsResult) {
    return { guitarId, predictedRating: null, message: "Target user not found" };
  }

  const { neighbors } = neighborsResult;

  if (neighbors.length === 0) {
    return { guitarId, predictedRating: null, message: "No neighbors found" };
  }

  // Get ratings for this guitar from neighbors
  const ratings = await prisma.rating.findMany({
    where: {
      userId: { in: neighbors.map((n) => n.userId) },
      guitarId: guitarId,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  if (ratings.length === 0) {
    return { guitarId, predictedRating: null, message: "No neighbors rated this guitar" };
  }

  // Calculate weighted average
  let numerator = 0;
  let denominator = 0;
  const details = [];

  for (const rating of ratings) {
    const neighbor = neighbors.find((n) => n.userId === rating.userId);
    if (neighbor) {
      numerator += neighbor.similarity * rating.averageRating;
      denominator += neighbor.similarity;
      details.push({
        userId: neighbor.userId,
        userName: neighbor.userName,
        similarity: neighbor.similarity,
        rating: rating.averageRating,
        weighted: Math.round(neighbor.similarity * rating.averageRating * 10000) / 10000,
      });
    }
  }

  const predictedRating = denominator > 0 ? Math.round((numerator / denominator) * 100) / 100 : null;

  return {
    guitarId,
    predictedRating,
    numerator: Math.round(numerator * 10000) / 10000,
    denominator: Math.round(denominator * 10000) / 10000,
    details,
  };
};

/**
 * Step 5: Predict All Unrated Items
 */
const predictAllUnratedItems = async (targetUserId, k = 3) => {
  const { matrix, guitars } = await buildUserItemMatrix();
  const targetUser = matrix.find((m) => m.userId === targetUserId);

  if (!targetUser) {
    throw new Error("Target user not found");
  }

  // Find unrated guitars
  const unratedGuitars = Object.entries(targetUser.ratings)
    .filter(([_, rating]) => rating === null)
    .map(([guitarId, _]) => parseInt(guitarId));

  const predictions = [];

  for (const guitarId of unratedGuitars) {
    const prediction = await predictRating(targetUserId, guitarId, k);
    if (prediction.predictedRating !== null) {
      const guitar = await prisma.guitar.findUnique({ where: { id: guitarId } });
      predictions.push({
        ...prediction,
        guitarName: guitar?.name,
      });
    }
  }

  // Sort by predicted rating descending
  predictions.sort((a, b) => b.predictedRating - a.predictedRating);

  return {
    targetUserId,
    k,
    predictions,
  };
};

/**
 * Step 6: Generate Recommendations
 * Returns top N recommended guitars for a user
 */
const generateRecommendations = async (targetUserId, k = 3, topN = 3) => {
  const { predictions } = await predictAllUnratedItems(targetUserId, k);

  // Get all rated items too
  const ratedItems = await prisma.rating.findMany({
    where: { userId: targetUserId },
    include: { guitar: true },
  });

  // Top recommendations from unrated items
  // If topN is -1, return all
  const limit = topN === -1 ? undefined : topN;

  const recommendations = predictions.slice(0, limit).map((pred, index) => {
    let category = "Kurang Direkomendasikan";
    if (pred.predictedRating >= 3.5) category = "Sangat Direkomendasikan";
    else if (pred.predictedRating >= 3.3) category = "Direkomendasikan";
    else if (pred.predictedRating >= 3.0) category = "Cukup Direkomendasikan";

    return {
      rank: index + 1,
      guitarId: pred.guitarId,
      guitarName: pred.guitarName,
      predictedRating: pred.predictedRating,
      category,
    };
  });

  return {
    targetUserId,
    k,
    topN,
    recommendations,
    allPredictions: predictions,
    ratedItems: ratedItems.map((r) => ({
      guitarId: r.guitarId,
      guitarName: r.guitar.name,
      actualRating: r.averageRating,
    })),
  };
};

/**
 * Get K value from system config
 */
const getKValue = async () => {
  const config = await prisma.systemConfig.findUnique({
    where: { key: "k_neighbors" },
  });
  return config ? parseInt(config.value) : 3;
};

/**
 * Set K value in system config
 */
const setKValue = async (k) => {
  await prisma.systemConfig.upsert({
    where: { key: "k_neighbors" },
    update: { value: k.toString() },
    create: { key: "k_neighbors", value: k.toString() },
  });
  return k;
};

module.exports = {
  buildUserItemMatrix,
  calculateUserSimilarity,
  findNearestNeighbors,
  predictRating,
  predictAllUnratedItems,
  generateRecommendations,
  getKValue,
  setKValue,
};
