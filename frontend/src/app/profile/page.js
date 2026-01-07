"use client";

import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import { FiUser, FiMail, FiCalendar, FiShield } from "react-icons/fi";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Pengguna</h1>

      <Card>
        <Card.Body className="p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2 capitalize">
                {user.role}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <FiUser className="w-5 h-5 text-gray-400" />
              <span className="font-medium w-32">Nama Lengkap:</span>
              <span>{user.name}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <FiMail className="w-5 h-5 text-gray-400" />
              <span className="font-medium w-32">Email:</span>
              <span>{user.email}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <FiShield className="w-5 h-5 text-gray-400" />
              <span className="font-medium w-32">Role:</span>
              <span className="capitalize">{user.role}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <FiCalendar className="w-5 h-5 text-gray-400" />
              <span className="font-medium w-32">Bergabung:</span>
              <span>{user.createdAt ? formatDate(user.createdAt) : "-"}</span>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors text-sm"
            >
              Log Out
            </button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
