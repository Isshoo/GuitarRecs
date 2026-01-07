/**
 * API Client for Guitar Recommendation System
 * Handles all HTTP requests to the backend API
 */

import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove("token");
      Cookies.remove("user");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  getProfile: () => apiClient.get("/auth/profile"),
  updateProfile: (data) => apiClient.put("/auth/profile", data),
};

// Guitar API
export const guitarAPI = {
  getAll: (params) => apiClient.get("/guitars", { params }),
  getById: (id) => apiClient.get(`/guitars/${id}`),
  create: (data) => apiClient.post("/guitars", data),
  update: (id, data) => apiClient.put(`/guitars/${id}`, data),
  delete: (id) => apiClient.delete(`/guitars/${id}`),
  getUnratedGuitarsByUser: (userId) => apiClient.get(`/guitars/unrated/${userId}`),
};

// User API (Admin)
export const userAPI = {
  getAll: () => apiClient.get("/users"),
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (data) => apiClient.post("/users", data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
  getUsersWithPendingPredictions: () => apiClient.get("/users/pending-predictions"),
};

// Rating API
export const ratingAPI = {
  getAll: () => apiClient.get("/ratings"),
  getMyRatings: () => apiClient.get("/ratings/my-ratings"),
  getRatingByUserAndGuitar: (guitarId) => apiClient.get(`/ratings/guitar/${guitarId}`),
  createOrUpdate: (data) => apiClient.post("/ratings", data),
  delete: (id) => apiClient.delete(`/ratings/${id}`),
  getStatistics: () => apiClient.get("/ratings/statistics"),
  getRatingsByUser: (userId) => apiClient.get(`/ratings/user/${userId}`),
};

// Recommendation API (CF Steps)
export const recommendationAPI = {
  // User - get own recommendations
  getMyRecommendations: (params) => apiClient.get("/recommendations/my-recommendations", { params }),

  // Admin - CF Process Steps
  getUserItemMatrix: () => apiClient.get("/recommendations/matrix"),
  getSimilarity: (userId) => apiClient.get(`/recommendations/similarity/${userId}`),
  getNearestNeighbors: (userId, k) => apiClient.get(`/recommendations/neighbors/${userId}`, { params: { k } }),
  getPrediction: (userId, guitarId, k) =>
    apiClient.get(`/recommendations/prediction/${userId}/${guitarId}`, { params: { k } }),
  getAllPredictions: (userId, k) => apiClient.get(`/recommendations/predictions/${userId}`, { params: { k } }),
  getRecommendationsForUser: (userId, params) => apiClient.get(`/recommendations/user/${userId}`, { params }),
  getEvaluation: (k) => apiClient.get("/recommendations/evaluation", { params: { k } }),

  // K Configuration
  getKConfig: () => apiClient.get("/recommendations/config/k"),
  setKConfig: (k) => apiClient.put("/recommendations/config/k", { k }),
};

export default apiClient;
