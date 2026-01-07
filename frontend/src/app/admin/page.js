"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { guitarAPI, userAPI, ratingAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Card from "@/components/ui/Card";
import { FiMusic, FiUsers, FiStar, FiActivity } from "react-icons/fi";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalGuitars: 0,
    totalUsers: 0,
    totalRatings: 0,
    avgRatingsPerUser: 0,
  });

  const { execute: fetchData } = useApi();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [guitars, users, ratings] = await Promise.all([
      fetchData(guitarAPI.getAll),
      fetchData(userAPI.getAll),
      fetchData(ratingAPI.getAll),
    ]);

    const ratingCount = ratings.success ? ratings.data.length : 0;
    const userCount = users.success ? users.data.length : 0;

    setStats({
      totalGuitars: guitars.success ? guitars.data.length : 0,
      totalUsers: userCount,
      totalRatings: ratingCount,
      avgRatingsPerUser: userCount > 0 ? (ratingCount / userCount).toFixed(1) : 0,
    });
  };

  const statCards = [
    { label: "Total Gitar", value: stats.totalGuitars, icon: FiMusic, color: "bg-blue-500", href: "/admin/guitars" },
    { label: "Total Users", value: stats.totalUsers, icon: FiUsers, color: "bg-green-500", href: "/admin/users" },
    {
      label: "Total Rating",
      value: stats.totalRatings,
      icon: FiStar,
      color: "bg-yellow-500",
      href: "/admin/cf/ratings",
    },
    {
      label: "Rata-rata Rating/User",
      value: stats.avgRatingsPerUser,
      icon: FiActivity,
      color: "bg-indigo-500",
      href: null,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Selamat datang kembali, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link key={index} href={stat.href || "#"} className={stat.href ? "cursor-pointer" : "cursor-default"}>
            <Card className="hover:shadow-md transition-shadow">
              <Card.Body className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </Card.Body>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </Card.Header>
          <Card.Body className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/guitars"
              className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors"
            >
              <span className="block font-medium text-blue-600 mb-1">Tambah Gitar</span>
              <span className="text-xs text-gray-500">Update koleksi gitar</span>
            </Link>
            <Link
              href="/admin/cf/matrix"
              className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors"
            >
              <span className="block font-medium text-blue-600 mb-1">Cek CF Matrix</span>
              <span className="text-xs text-gray-500">Lihat matriks user-item</span>
            </Link>
            <Link
              href="/admin/evaluation"
              className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors"
            >
              <span className="block font-medium text-blue-600 mb-1">Evaluasi Model</span>
              <span className="text-xs text-gray-500">Cek performa MAE/RMSE</span>
            </Link>
            <Link
              href="/admin/users"
              className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors"
            >
              <span className="block font-medium text-blue-600 mb-1">Kelola User</span>
              <span className="text-xs text-gray-500">Lihat data pengguna</span>
            </Link>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">System Info</h3>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Algorithm</span>
              <span className="font-medium">User-Based Collaborative Filtering</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Similarity Metric</span>
              <span className="font-medium">Cosine Similarity</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Default K-Neighbors</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Last Database Update</span>
              <span className="font-medium text-green-600">Live</span>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
