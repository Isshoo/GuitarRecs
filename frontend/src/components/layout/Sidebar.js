"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FiHome,
  FiMusic,
  FiUsers,
  FiActivity,
  FiLogOut,
  FiGrid,
  FiLink,
  FiTarget,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (user?.role !== "admin") return null;

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  const mainLinks = [
    { name: "Dashboard", href: "/admin", icon: FiHome },
    { name: "Manajemen Gitar", href: "/admin/guitars", icon: FiMusic },
    { name: "Manajemen User", href: "/admin/users", icon: FiUsers },
  ];

  const cfLinks = [
    { name: "1. Data Rating", href: "/admin/cf/ratings", icon: FiStar },
    { name: "2. Matriks User-Item", href: "/admin/cf/matrix", icon: FiGrid },
    { name: "3. Similarity", href: "/admin/cf/similarity", icon: FiLink },
    { name: "4. Nearest Neighbors", href: "/admin/cf/neighbors", icon: FiUsers },
    { name: "5. Prediksi", href: "/admin/cf/prediction", icon: FiActivity },
    { name: "6. Hasil", href: "/admin/cf/results", icon: FiTarget },
  ];

  const evalLinks = [{ name: "Evaluasi Performa", href: "/admin/evaluation", icon: FiTrendingUp }];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
          <span className="font-bold text-xl tracking-wide">Admin Panel</span>
        </div>
      </div>

      <div className="py-6 px-4 space-y-8">
        {/* Main Menu */}
        <div>
          <h3 className="text-xs uppercase text-slate-500 font-semibold mb-3 px-2">Main Menu</h3>
          <div className="space-y-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href) && pathname === link.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Collaborative Filtering Steps */}
        <div>
          <h3 className="text-xs uppercase text-slate-500 font-semibold mb-3 px-2">Collaborative Filtering</h3>
          <div className="space-y-1">
            {cfLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href) ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Evaluation */}
        <div>
          <h3 className="text-xs uppercase text-slate-500 font-semibold mb-3 px-2">Evaluation</h3>
          <div className="space-y-1">
            {evalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href) ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="font-bold text-xs">{user?.name?.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
