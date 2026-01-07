/**
 * Error Handler Middleware
 * Centralized error handling for the API
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(400).json({
      success: false,
      message: "Data sudah ada (duplicate entry)",
      error: err.meta?.target || "Unknown field",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Data tidak ditemukan",
      error: err.message,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
      error: err.message,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token sudah expired",
      error: err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
