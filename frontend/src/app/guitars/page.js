"use client";

import { useState, useEffect } from "react";
import { guitarAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import GuitarCard from "@/components/features/GuitarCard";
import Input from "@/components/ui/Input";
import { FiSearch, FiFilter } from "react-icons/fi";

export default function GuitarsPage() {
  const [guitars, setGuitars] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    brand: "",
    type: "",
  });

  const { loading, error, execute: fetchGuitars } = useApi();

  useEffect(() => {
    loadGuitars();
  }, []);

  const loadGuitars = async () => {
    const result = await fetchGuitars(guitarAPI.getAll, filters);
    if (result.success) {
      setGuitars(result.data);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadGuitars();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Koleksi Gitar</h1>
        <p className="text-gray-600 mb-6">Jelajahi berbagai pilihan gitar akustik dan klasik berkualitas.</p>

        {/* Filter & Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="grow">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama gitar..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                >
                  <option value="">Semua Merek</option>
                  <option value="Yamaha">Yamaha</option>
                  <option value="Cort">Cort</option>
                  <option value="Anderson">Anderson</option>
                </select>
              </div>
            </div>

            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">Semua Tipe</option>
                <option value="Akustik">Akustik</option>
                <option value="Klasik">Klasik</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Cari
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600 bg-red-50 rounded-lg">{error}</div>
      ) : guitars.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-lg">Tidak ada gitar yang ditemukan.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guitars.map((guitar) => (
            <GuitarCard key={guitar.id} guitar={guitar} />
          ))}
        </div>
      )}
    </div>
  );
}
