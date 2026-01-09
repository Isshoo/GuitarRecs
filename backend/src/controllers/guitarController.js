/**
 * Guitar Controller
 * CRUD operations for guitars
 */

const prisma = require("../config/database");

/**
 * Helper to determine price range
 * <= Rp 749.999
 * Rp 750.000 – 999.999
 * Rp 1.000.000 – 1.249.999
 * >= Rp 1.250.000
 */
const determinePriceRange = (price) => {
  const p = parseInt(price);
  if (p <= 749999) return "<= Rp 749.999";
  if (p <= 999999) return "Rp 750.000 – 999.999";
  if (p <= 1249999) return "Rp 1.000.000 – 1.249.999";
  return ">= Rp 1.250.000";
};

class GuitarController {
  /**
   * Get all guitars
   */
  static async getAllGuitars(req, res, next) {
    try {
      const { brand, type, search, priceRange } = req.query;

      const where = {};
      if (brand) where.brand = brand;
      if (type) where.type = type;
      if (priceRange) where.priceRange = priceRange;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
        ];
      }

      const guitars = await prisma.guitar.findMany({
        where,
        include: {
          _count: { select: { ratings: true } },
          ratings: {
            select: { averageRating: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      // Calculate average rating for each guitar
      const guitarsWithAvg = guitars.map((guitar) => {
        const avgRating =
          guitar.ratings.length > 0
            ? guitar.ratings.reduce((acc, r) => acc + r.averageRating, 0) / guitar.ratings.length
            : null;

        return {
          ...guitar,
          ratings: undefined,
          averageRating: avgRating ? Math.round(avgRating * 100) / 100 : null,
          totalRatings: guitar._count.ratings,
        };
      });

      res.json({
        success: true,
        data: guitarsWithAvg,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get guitar by ID
   */
  static async getGuitarById(req, res, next) {
    try {
      const { id } = req.params;

      const guitar = await prisma.guitar.findUnique({
        where: { id: parseInt(id) },
        include: {
          ratings: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!guitar) {
        return res.status(404).json({
          success: false,
          message: "Gitar tidak ditemukan",
        });
      }

      // Calculate average rating
      const avgRating =
        guitar.ratings.length > 0
          ? guitar.ratings.reduce((acc, r) => acc + r.averageRating, 0) / guitar.ratings.length
          : null;

      res.json({
        success: true,
        data: {
          ...guitar,
          averageRating: avgRating ? Math.round(avgRating * 100) / 100 : null,
          totalRatings: guitar.ratings.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new guitar (Admin only)
   */
  static async createGuitar(req, res, next) {
    try {
      const { name, brand, type, bodyType, strings, price, imageUrl } = req.body;

      if (!name || !brand || !type || !bodyType || !strings || !price) {
        return res.status(400).json({
          success: false,
          message: "Semua field (kecuali gambar) wajib diisi",
        });
      }

      // Check duplicate name
      const existingGuitar = await prisma.guitar.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });

      if (existingGuitar) {
        return res.status(400).json({
          success: false,
          message: "Gitar dengan nama tersebut sudah ada",
        });
      }

      const priceRange = determinePriceRange(price);

      const guitar = await prisma.guitar.create({
        data: {
          name,
          brand,
          type,
          bodyType,
          strings,
          price: parseInt(price),
          priceRange,
          imageUrl: imageUrl !== "" ? imageUrl : null,
        },
      });

      res.status(201).json({
        success: true,
        message: "Gitar berhasil ditambahkan",
        data: guitar,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update guitar (Admin only)
   */
  static async updateGuitar(req, res, next) {
    try {
      const { id } = req.params;
      const { name, brand, type, bodyType, strings, price, imageUrl } = req.body;

      // Check duplicate name (excluding self)
      if (name) {
        const existingGuitar = await prisma.guitar.findFirst({
          where: {
            name: { equals: name, mode: "insensitive" },
            NOT: { id: parseInt(id) },
          },
        });

        if (existingGuitar) {
          return res.status(400).json({
            success: false,
            message: "Gitar dengan nama tersebut sudah ada",
          });
        }
      }

      const updateData = {
        name,
        brand,
        type,
        bodyType,
        strings,
        imageUrl: imageUrl !== "" ? imageUrl : null,
      };

      if (price) {
        updateData.price = parseInt(price);
        updateData.priceRange = determinePriceRange(price);
      }

      const guitar = await prisma.guitar.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      res.json({
        success: true,
        message: "Gitar berhasil diupdate",
        data: guitar,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete guitar (Admin only)
   */
  static async deleteGuitar(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.guitar.delete({
        where: { id: parseInt(id) },
      });

      res.json({
        success: true,
        message: "Gitar berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unrated guitars for a specific user
   */
  static async getUnratedGuitarsByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const parsedUserId = parseInt(userId);

      if (!parsedUserId) {
        return res.status(400).json({ success: false, message: "Invalid User ID" });
      }

      // Get all guitar IDs
      const allGuitars = await prisma.guitar.findMany({
        select: { id: true, name: true, brand: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      // Get rated guitar IDs for this user
      const userRatings = await prisma.rating.findMany({
        where: { userId: parsedUserId },
        select: { guitarId: true },
      });

      const ratedGuitarIds = new Set(userRatings.map((r) => r.guitarId));

      // Filter
      const unratedGuitars = allGuitars.filter((g) => !ratedGuitarIds.has(g.id));

      res.json({
        success: true,
        data: unratedGuitars,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GuitarController;
