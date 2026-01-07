"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { guitarAPI, ratingAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RatingStars from "@/components/features/RatingStars";
import Modal from "@/components/ui/Modal";
import { FiEdit2, FiCheck, FiMusic, FiStar } from "react-icons/fi";

export default function RatingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [guitars, setGuitars] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [selectedGuitar, setSelectedGuitar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Rating form state
  const [ratingForm, setRatingForm] = useState({
    jenisGitar: 0,
    bahanBody: 0,
    jenisSenar: 0,
    merek: 0,
    harga: 0,
  });

  const { loading, execute: fetchData } = useApi();
  const { execute: submitRating, loading: submitting } = useApi();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    const [guitarsRes, ratingsRes] = await Promise.all([
      fetchData(guitarAPI.getAll),
      fetchData(ratingAPI.getMyRatings),
    ]);

    if (guitarsRes.success) {
      setGuitars(guitarsRes.data);
    }

    if (ratingsRes.success) {
      // Convert array to object for easier lookup
      const ratingsMap = {};
      ratingsRes.data.forEach((r) => {
        ratingsMap[r.guitarId] = r;
      });
      setUserRatings(ratingsMap);
    }
  };

  const handleRateClick = (guitar) => {
    setSelectedGuitar(guitar);

    // Check if duplicate rating exists
    const existingRating = userRatings[guitar.id];
    if (existingRating) {
      setRatingForm({
        jenisGitar: existingRating.jenisGitar,
        bahanBody: existingRating.bahanBody,
        jenisSenar: existingRating.jenisSenar,
        merek: existingRating.merek,
        harga: existingRating.harga,
      });
    } else {
      setRatingForm({
        jenisGitar: 0,
        bahanBody: 0,
        jenisSenar: 0,
        merek: 0,
        harga: 0,
      });
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    // Validate
    if (Object.values(ratingForm).some((v) => v === 0)) {
      alert("Harap isi semua kriteria rating");
      return;
    }

    const result = await submitRating(ratingAPI.createOrUpdate, {
      guitarId: selectedGuitar.id,
      ...ratingForm,
    });

    if (result.success) {
      // Update local state
      setUserRatings((prev) => ({
        ...prev,
        [selectedGuitar.id]: result.data,
      }));
      setIsModalOpen(false);
    }
  };

  const averageFormRating = () => {
    const values = Object.values(ratingForm);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Beri Rating Gitar</h1>
          <p className="text-gray-600 mt-2">Beri penilaian untuk mendapatkan rekomendasi yang lebih akurat.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm">
          {Object.keys(userRatings).length} / {guitars.length} Gitar Dinilai
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guitars.map((guitar) => {
            const hasRated = !!userRatings[guitar.id];

            return (
              <Card key={guitar.id} className={`border-l-4 ${hasRated ? "border-l-green-500" : "border-l-gray-300"}`}>
                <div className="p-4 flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {guitar.imageUrl ? (
                      <img src={guitar.imageUrl} alt={guitar.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <FiMusic className="text-gray-400 w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{guitar.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      {guitar.brand} • {guitar.type}
                    </p>

                    {hasRated ? (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-3">
                        <FiCheck className="w-4 h-4" />
                        Sudah Dinilai ({userRatings[guitar.id].averageRating.toFixed(1)})
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mb-3 italic">Belum dinilai</p>
                    )}

                    <Button
                      size="sm"
                      variant={hasRated ? "outline" : "primary"}
                      onClick={() => handleRateClick(guitar)}
                      className="w-full sm:w-auto"
                    >
                      {hasRated ? "Update Rating" : "Beri Rating"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Rating: ${selectedGuitar?.name}`}>
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 mb-4">
            Berikan nilai 1-5 bintang untuk setiap kriteria di bawah ini.
          </div>

          {[
            { key: "jenisGitar", label: "Jenis Gitar (Suara/Tone)" },
            { key: "bahanBody", label: "Bahan Body (Material)" },
            { key: "jenisSenar", label: "Jenis Senar (Playability)" },
            { key: "merek", label: "Reputasi Merek" },
            { key: "harga", label: "Value for Money (Harga)" },
          ].map((criteria) => (
            <div
              key={criteria.key}
              className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
            >
              <span className="font-medium text-gray-700">{criteria.label}</span>
              <RatingStars
                rating={ratingForm[criteria.key]}
                interactive={true}
                size="lg"
                onChange={(val) => setRatingForm({ ...ratingForm, [criteria.key]: val })}
              />
            </div>
          ))}

          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <span className="font-bold text-gray-900">Rata-rata Rating</span>
            <span className="text-2xl font-bold text-blue-600 flex items-center gap-1">
              <FiStar className="fill-current" />
              {averageFormRating().toFixed(1)}
            </span>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Simpan Rating
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
