"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <>
      {!isAdmin && <Navbar />}
      {isAdmin && <Sidebar />}

      <main className={`grow ${isAdmin ? "ml-64 p-8" : ""}`}>{children}</main>

      {!isAdmin && <Footer />}
    </>
  );
}
