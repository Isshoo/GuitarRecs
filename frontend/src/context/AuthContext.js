/**
 * Auth Context Provider
 * Manages authentication state globally
 */

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { authAPI } from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = Cookies.get("token");
    const savedUser = Cookies.get("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        Cookies.remove("token");
        Cookies.remove("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;

      setUser(user);
      Cookies.set("token", token, { expires: 7 });
      Cookies.set("user", JSON.stringify(user), { expires: 7 });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password });
      const { user, token } = response.data;

      setUser(user);
      Cookies.set("token", token, { expires: 7 });
      Cookies.set("user", JSON.stringify(user), { expires: 7 });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("token");
    Cookies.remove("user");
    window.location.href = "/login";
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
