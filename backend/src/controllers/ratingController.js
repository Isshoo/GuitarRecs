/**
 * Rating Controller
 * Handle user ratings for guitars
 */

const prisma = require("../config/database");

/**
 * Get all ratings (Admin)
 */
const getAllRatings = async (req, res, next) => {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        user: { select: { id: true, name: true } },
        guitar: { select: { id: true, name: true, brand: true } },
      },
      orderBy: [{ user: { name: "asc" } }, { guitar: { name: "asc" } }],
    });

    res.json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ratings by user
 */
const getRatingsByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId) : req.user.id;

    const ratings = await prisma.rating.findMany({
      where: { userId },
      include: {
        guitar: true,
      },
      orderBy: { guitar: { name: "asc" } },
    });

    res.json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get rating for specific guitar by current user
 */
const getUserRatingForGuitar = async (req, res, next) => {
  try {
    const { guitarId } = req.params;

    const rating = await prisma.rating.findUnique({
      where: {
        userId_guitarId: {
          userId: req.user.id,
          guitarId: parseInt(guitarId),
        },
      },
    });

    res.json({
      success: true,
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update rating
 */
const createOrUpdateRating = async (req, res, next) => {
  try {
    const { guitarId, jenisGitar, bahanBody, jenisSenar, merek, harga } = req.body;

    // Validate ratings are 1-5
    const ratings = [jenisGitar, bahanBody, jenisSenar, merek, harga];
    if (ratings.some((r) => r < 1 || r > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating harus antara 1-5",
      });
    }

    // Calculate average rating
    const averageRating = ratings.reduce((a, b) => a + b, 0) / 5;

    const rating = await prisma.rating.upsert({
      where: {
        userId_guitarId: {
          userId: req.user.id,
          guitarId: parseInt(guitarId),
        },
      },
      update: {
        jenisGitar,
        bahanBody,
        jenisSenar,
        merek,
        harga,
        averageRating,
      },
      create: {
        userId: req.user.id,
        guitarId: parseInt(guitarId),
        jenisGitar,
        bahanBody,
        jenisSenar,
        merek,
        harga,
        averageRating,
      },
      include: {
        guitar: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      message: "Rating berhasil disimpan",
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete rating
 */
const deleteRating = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.rating.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Rating berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get rating statistics (Admin)
 */
const getRatingStatistics = async (req, res, next) => {
  try {
    const totalRatings = await prisma.rating.count();
    const totalUsers = await prisma.user.count({ where: { role: "user" } });
    const totalGuitars = await prisma.guitar.count();

    const usersWithRatings = await prisma.rating.groupBy({
      by: ["userId"],
      _count: true,
    });

    const guitarsWithRatings = await prisma.rating.groupBy({
      by: ["guitarId"],
      _count: true,
    });

    res.json({
      success: true,
      data: {
        totalRatings,
        totalUsers,
        totalGuitars,
        usersWithRatings: usersWithRatings.length,
        guitarsWithRatings: guitarsWithRatings.length,
        averageRatingsPerUser: totalRatings / (usersWithRatings.length || 1),
        averageRatingsPerGuitar: totalRatings / (guitarsWithRatings.length || 1),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRatings,
  getRatingsByUser,
  getUserRatingForGuitar,
  createOrUpdateRating,
  deleteRating,
  getRatingStatistics,
};
