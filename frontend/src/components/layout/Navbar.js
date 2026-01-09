"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FiHome, FiMusic, FiStar, FiCpu, FiUser, FiLogOut, FiMenu, FiX, FiLogIn } from "react-icons/fi";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // If user is admin, don't show this navbar (admin has sidebar)
  // Or handle it in the main layout wrapper
  if (user?.role === "admin") return null;

  const isActive = (path) => pathname === path;

  const navLinks = [
    { name: "Beranda", href: "/", icon: FiHome },
    { name: "Daftar Gitar", href: "/guitars", icon: FiMusic },
    { name: "Beri Rating", href: "/rating", icon: FiStar },
    { name: "Rekomendasi", href: "/recommendations", icon: FiCpu },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                G
              </div>
              <span className="font-bold text-xl text-gray-800">GuitarRecs</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}

            <div className="border-l pl-4 ml-4 flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/profile")
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <FiUser className="w-4 h-4" />
                    {user.name}
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <FiLogIn className="w-4 h-4" />
                  Masuk
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </div>
              </Link>
            ))}

            <div className="border-t pt-4 mt-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive("/profile")
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FiUser className="w-5 h-5" />
                      {user.name}
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <div className="flex items-center gap-3">
                      <FiLogOut className="w-5 h-5" />
                      Keluar
                    </div>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <FiLogIn className="w-5 h-5" />
                    Masuk
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
