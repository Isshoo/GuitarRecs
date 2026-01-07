"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { recommendationAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FiTrendingUp, FiAlertCircle, FiStar, FiMusic } from "react-icons/fi";

export default function RecommendationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState([]);
  const [ratedItems, setRatedItems] = useState([]);
  const { loading, error, execute: fetchRecommendations } = useApi();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    const result = await fetchRecommendations(recommendationAPI.getMyRecommendations);
    if (result.success) {
      setRecommendations(result.data.recommendations);
      setRatedItems(result.data.ratedItems);
    }
  };

  const getConfidenceLevel = (rating) => {
    if (rating >= 3.5) return { label: "Sangat Direkomendasikan", color: "bg-green-100 text-green-800" };
    if (rating >= 3.0) return { label: "Direkomendasikan", color: "bg-blue-100 text-blue-800" };
    return { label: "Cukup Direkomendasikan", color: "bg-yellow-100 text-yellow-800" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Rekomendasi Untuk Anda</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Berdasarkan analisis kemiripan selera Anda dengan pengguna lain (Colloborative Filtering), berikut adalah
          gitar yang mungkin Anda sukai.
        </p>
      </div>

      {ratedItems.length < 2 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg">
          <div className="flex">
            <div className="shrink-0">
              <FiAlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Data rating Anda masih sedikit.{" "}
                <Link href="/rating" className="font-medium underline hover:text-yellow-600">
                  Beri rating lebih banyak gitar
                </Link>{" "}
                untuk hasil rekomendasi yang lebih akurat.
              </p>
            </div>
          </div>
        </div>
      )}

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((item, index) => {
            const badge = getConfidenceLevel(item.predictedRating);
            const isTopPick = index === 0;

            return (
              <Card
                key={item.guitarId}
                className={`relative overflow-hidden transition-transform hover:-translate-y-1 ${
                  isTopPick ? "ring-2 ring-blue-500 shadow-lg" : ""
                }`}
              >
                {isTopPick && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    #1 Pilihan Terbaik
                  </div>
                )}

                <div className="bg-gray-100 h-48 flex items-center justify-center">
                  {/* Placeholder for guitar image - in real app would join with guitar table */}
                  <FiMusic className="text-gray-400 w-16 h-16" />
                </div>

                <Card.Body className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.guitarName}</h3>
                    <div className="flex flex-col items-end">
                      <span className="flex items-center gap-1 text-2xl font-bold text-blue-600">
                        <FiTrendingUp className="w-5 h-5" />
                        {item.predictedRating.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">Prediksi Skor</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <Link href={`/guitars/${item.guitarId}`}>
                    <Button className="w-full">Lihat Detail Gitar</Button>
                  </Link>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">Belum ada rekomendasi yang tersedia.</p>
          <Link href="/rating">
            <Button>Mulai Beri Rating</Button>
          </Link>
        </div>
      )}

      {/* History Section */}
      <div className="mt-16 border-t pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6 px-2">Riwayat Rating Anda</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {ratedItems.map((rating) => (
              <li key={rating.guitarId}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiMusic className="text-gray-500" />
                      </div>
                      <p className="ml-4 text-sm font-medium text-blue-600 truncate">{rating.guitarName}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiStar className="shrink-0 mr-1.5 h-5 w-5 text-yellow-400 fill-current" />
                        <span className="font-bold text-gray-900">{rating.actualRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {ratedItems.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500 text-sm">Anda belum memberikan rating apapun</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
