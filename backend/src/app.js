/**
 * Express App Entry Point
 * Guitar Recommendation System API
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

// Import routes
const authRoutes = require("./routes/authRoutes");
const guitarRoutes = require("./routes/guitarRoutes");
const userRoutes = require("./routes/userRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Guitar Recommendation API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/guitars", guitarRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/recommendations", recommendationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🎸 Guitar Recommendation API running on http://localhost:${PORT}`);
  console.log(`📚 API Endpoints:`);
  console.log(`   - Auth:            /api/auth`);
  console.log(`   - Guitars:         /api/guitars`);
  console.log(`   - Users:           /api/users`);
  console.log(`   - Ratings:         /api/ratings`);
  console.log(`   - Recommendations: /api/recommendations`);
});

module.exports = app;
