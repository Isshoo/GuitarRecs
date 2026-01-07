"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { guitarAPI, ratingAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import RatingStars from "@/components/features/RatingStars";
import { FiStar } from "react-icons/fi";

export default function GuitarDetailPage({ params }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { user } = useAuth();
  const router = useRouter();

  const [guitar, setGuitar] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Rating form state
  const [ratingForm, setRatingForm] = useState({
    jenisGitar: 0,
    bahanBody: 0,
    jenisSenar: 0,
    merek: 0,
    harga: 0,
  });

  const { loading, execute: fetchGuitar } = useApi();
  const { loading: submitting, execute: submitRating } = useApi();

  useEffect(() => {
    if (id) {
      loadGuitar();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkUserRating();
    }
  }, [user, id]);

  const loadGuitar = async () => {
    const result = await fetchGuitar(guitarAPI.getById, id);
    if (result.success) {
      setGuitar(result.data);
    }
  };

  const checkUserRating = async () => {
    // We can fetch user's rating for this guitar specifically
    try {
      const result = await ratingAPI.getRatingByUserAndGuitar(id);
      if (result.success && result.data) {
        setUserRating(result.data);
      }
    } catch (e) {
      // Ignore if 404 or other errors
    }
  };

  const handleRateClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (userRating) {
      setRatingForm({
        jenisGitar: userRating.jenisGitar,
        bahanBody: userRating.bahanBody,
        jenisSenar: userRating.jenisSenar,
        merek: userRating.merek,
        harga: userRating.harga,
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

  const handleSubmitRating = async () => {
    if (Object.values(ratingForm).some((v) => v === 0)) {
      alert("Harap isi semua kriteria rating");
      return;
    }

    const result = await submitRating(ratingAPI.createOrUpdate, {
      guitarId: parseInt(id),
      ...ratingForm,
    });

    if (result.success) {
      setUserRating(result.data);
      setIsModalOpen(false);
      // Refresh guitar data to show new averages
      loadGuitar();
    }
  };

  const averageFormRating = () => {
    const values = Object.values(ratingForm);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  if (loading && !guitar) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!guitar) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Gitar tidak ditemukan</h2>
        <Link href="/guitars" className="text-blue-600 hover:underline mt-4 inline-block">
          Kembali ke Daftar Gitar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-8">
      {/* Breadcrumb / Back Button */}
      <div>
        <Link
          href="/guitars"
          className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Daftar Gitar
        </Link>
      </div>

      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{guitar.name}</h1>
          <div className="flex justify-center items-center gap-3">
            <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">{guitar.brand}</span>
            <span className="bg-gray-100 text-gray-800 text-sm font-bold px-3 py-1 rounded-full">{guitar.type}</span>
          </div>
          <p className="text-4xl font-bold text-blue-600">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(guitar.price)}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Image & Specifications */}
          <div className="space-y-6">
            {/* Image Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center">
              {guitar.imageUrl ? (
                <img
                  src={guitar.imageUrl}
                  alt={guitar.name}
                  className="w-full h-auto max-h-[400px] object-contain hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-gray-300">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Specs Card - Fill remaining space */}
            <Card className="flex-1 flex flex-col">
              <Card.Header>
                <h3 className="text-xl font-bold text-gray-900">Spesifikasi Lengkap</h3>
              </Card.Header>
              <Card.Body className="flex-1 overflow-y-auto custom-scrollbar">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 flex justify-between items-center px-2 hover:bg-gray-50 rounded transition-colors">
                    <dt className="text-sm font-medium text-gray-500">Brand</dt>
                    <dd className="text-sm text-gray-900 font-bold">{guitar.brand}</dd>
                  </div>
                  <div className="py-4 flex justify-between items-center px-2 hover:bg-gray-50 rounded transition-colors">
                    <dt className="text-sm font-medium text-gray-500">Tipe Gitar</dt>
                    <dd className="text-sm text-gray-900 font-bold">{guitar.type}</dd>
                  </div>
                  <div className="py-4 flex justify-between items-center px-2 hover:bg-gray-50 rounded transition-colors">
                    <dt className="text-sm font-medium text-gray-500">Bentuk Body</dt>
                    <dd className="text-sm text-gray-900 font-bold">{guitar.bodyType}</dd>
                  </div>
                  <div className="py-4 flex justify-between items-center px-2 hover:bg-gray-50 rounded transition-colors">
                    <dt className="text-sm font-medium text-gray-500">Jumlah Senar</dt>
                    <dd className="text-sm text-gray-900 font-bold">{guitar.strings} Senar</dd>
                  </div>
                  <div className="py-4 flex justify-between items-center px-2 hover:bg-gray-50 rounded transition-colors">
                    <dt className="text-sm font-medium text-gray-500">Range Harga</dt>
                    <dd className="text-sm text-gray-900 font-bold">{guitar.priceRange}</dd>
                  </div>
                </dl>
              </Card.Body>
            </Card>
          </div>

          {/* Right Column: Ratings & Reviews */}
          <div className="max-h-[600px]">
            <Card className="h-full flex flex-col overflow-hidden">
              <Card.Header className="shrink-0 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Rating & Ulasan</h3>
                {user && (
                  <Button size="sm" onClick={handleRateClick} variant={userRating ? "outline" : "primary"}>
                    {userRating ? "Edit Rating" : "Beri Rating"}
                  </Button>
                )}
              </Card.Header>
              <Card.Body className="flex-1 overflow-hidden flex flex-col">
                <div className="shrink-0">
                  <div className="flex flex-col items-center justify-center py-6 mb-6 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-5xl font-extrabold text-gray-900">
                        {guitar.averageRating ? guitar.averageRating.toFixed(1) : "0.0"}
                      </span>
                      <span className="text-gray-500 font-medium mb-2">/ 5.0</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-6 h-6 ${
                            star <= Math.round(guitar.averageRating || 0) ? "text-yellow-400" : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Berdasarkan {guitar.totalRatings} ulasan</span>
                  </div>
                </div>

                {guitar.ratings && guitar.ratings.length > 0 ? (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    <h4 className="font-bold text-gray-900 text-sm border-b pb-2 sticky top-0 bg-white z-10">
                      Ulasan Pembeli
                    </h4>
                    <div className="space-y-3 pb-4 max-h-[370px] overflow-y-auto custom-scrollbar">
                      {guitar.ratings.map((rating, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-900">{rating.user?.name || "User"}</span>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded">
                              ★ {rating.averageRating}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 italic">
                            User memberikan rating bintang {rating.averageRating}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-gray-400 italic">Belum ada ulasan untuk gitar ini.</p>
                    <p className="text-sm text-gray-500 mt-2">Jadilah yang pertama memberikan rating!</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${userRating ? "Update Rating" : "Beri Rating"}: ${guitar.name}`}
      >
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
            <Button onClick={handleSubmitRating} loading={submitting}>
              {userRating ? "Update Rating" : "Kirim Rating"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
