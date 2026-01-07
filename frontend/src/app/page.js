"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { FiStar, FiMusic, FiCheckCircle } from "react-icons/fi";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Temukan Gitar Impian</span>
            <span className="block text-blue-600">Sesuai Gaya Kamu</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Sistem rekomendasi cerdas menggunakan metode User-Based Collaborative Filtering untuk membantu Anda memilih
            gitar akustik atau klasik yang paling cocok.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href={isAuthenticated ? "/recommendations" : "/login"}>
                <Button size="lg" className="w-full flex items-center gap-2">
                  <FiStar className="w-5 h-5" />
                  Dapatkan Rekomendasi
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link href="/guitars">
                <Button variant="secondary" size="lg" className="w-full flex items-center gap-2">
                  <FiMusic className="w-5 h-5" />
                  Lihat Koleksi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Bagaimana Cara Kerjanya?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "1. Beri Penilaian",
              description: "Berikan rating pada beberapa gitar berdasarkan preferensi Anda (suara, kenyamanan, harga).",
              icon: FiStar,
            },
            {
              title: "2. Analisis Kemiripan",
              description: "Sistem mencocokkan profil Anda dengan pengguna lain yang memiliki selera serupa.",
              icon: FiCheckCircle,
            },
            {
              title: "3. Terima Rekomendasi",
              description: "Dapatkan daftar gitar yang direkomendasikan khusus untuk Anda berdasarkan prediksi akurat.",
              icon: FiMusic,
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl text-center mb-6">
            <span className="block">Siap menemukan gitar pertamamu?</span>
          </h2>
          <Link href={isAuthenticated ? "/rating" : "/register"}>
            <button className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10">
              Mulai Sekarang
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
