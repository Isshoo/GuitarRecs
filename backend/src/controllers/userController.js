/**
 * User Controller
 * CRUD operations for users (Admin)
 */

const prisma = require("../config/database");
const bcrypt = require("bcryptjs");

class UserController {
  /**
   * Get all users
   */
  static async getAllUsers(req, res, next) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { ratings: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      res.json({
        success: true,
        data: users.map((u) => ({
          ...u,
          totalRatings: u._count.ratings,
          _count: undefined,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          ratings: {
            include: {
              guitar: { select: { id: true, name: true, brand: true } },
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create user (Admin only)
   */
  static async createUser(req, res, next) {
    try {
      const { name, email, password, role = "user" } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Nama, email, dan password wajib diisi",
        });
      }

      // Check duplicate email
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email sudah terdaftar",
        });
      }

      // Check duplicate name
      const existingUserByName = await prisma.user.findFirst({
        where: { name },
      });

      if (existingUserByName) {
        return res.status(400).json({
          success: false,
          message: "Nama sudah terdaftar",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "User berhasil ditambahkan",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user (Admin only)
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, role, password } = req.body;

      // Check duplicate email (excluding self)
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: {
              id: parseInt(id),
            },
          },
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email sudah terdaftar",
          });
        }
      }

      // Check duplicate name (excluding self)
      if (name) {
        const existingUser = await prisma.user.findFirst({
          where: {
            name,
            NOT: {
              id: parseInt(id),
            },
          },
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Nama sudah terdaftar",
          });
        }
      }

      const updateData = { name, email, role };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      res.json({
        success: true,
        message: "User berhasil diupdate",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id: parseInt(id) },
      });

      res.json({
        success: true,
        message: "User berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users who haven't rated all guitars
   */
  static async getUsersWithPendingPredictions(req, res, next) {
    try {
      const totalGuitars = await prisma.guitar.count();

      const users = await prisma.user.findMany({
        where: { role: "user" },
        select: {
          id: true,
          name: true,
          _count: { select: { ratings: true } },
        },
        orderBy: { name: "asc" },
      });

      const eligibleUsers = users.filter((u) => u._count.ratings < totalGuitars);

      res.json({
        success: true,
        data: eligibleUsers.map((u) => ({
          id: u.id,
          name: u.name,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
