"use client";

import { useState, useEffect } from "react";
import { recommendationAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Table from "@/components/ui/Table";
import Card from "@/components/ui/Card";

export default function EvaluationPage() {
  const [evaluation, setEvaluation] = useState(null);
  const [userSummaries, setUserSummaries] = useState([]);
  const [showFormulas, setShowFormulas] = useState(false);
  const { loading, execute: fetchEvaluation } = useApi();

  useEffect(() => {
    loadEvaluation();
  }, []);

  const loadEvaluation = async () => {
    const result = await fetchEvaluation(recommendationAPI.getEvaluation);
    if (result.success) {
      setEvaluation(result.data);
      setUserSummaries(result.data.userSummaries);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluasi Performa</h1>
          <p className="text-gray-500">Evaluasi akurasi sistem menggunakan Leave-One-Out Cross Validation (LOOCV).</p>
        </div>
        <button
          onClick={() => setShowFormulas(!showFormulas)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
        >
          {showFormulas ? "Sembunyikan Rumus" : "Lihat Rumus & Penjelasan"}
        </button>
      </div>

      {showFormulas && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 space-y-6 animate-fade-in-down">
          {/* LOOCV Explanation */}
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-900 mb-2">Bagaimana Data Test Diperoleh? (LOOCV)</h4>
            <p className="text-gray-700 text-sm mb-3">
              Sistem menggunakan metode <strong>Leave-One-Out Cross Validation (LOOCV)</strong>. Karena kita tidak
              memisahkan data latih dan data uji secara manual, sistem melakukan simulasi sebagai berikut:
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-2">
              <li>
                Sistem mengambil <strong>semua rating</strong> yang ada di database (Total:{" "}
                {evaluation?.totalRatings || "n"} data).
              </li>
              <li>
                Satu rating diambil sebagai <strong>"Data Test"</strong> dan disembunyikan sementara.
              </li>
              <li>
                Sisa rating lainnya dijadikan <strong>"Data Latih"</strong> untuk menghitung prediksi.
              </li>
              <li>Sistem memprediksi rating yang disembunyikan tersebut.</li>
              <li>
                Selisih antara <strong>Rating Asli (Ri)</strong> dan <strong>Prediksi (Ri_hat)</strong> dihitung sebagai
                error.
              </li>
              <li>
                Proses ini diulang untuk <strong>setiap rating</strong> dalam database.
              </li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MAE Formula */}
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Rumus MAE (Mean Absolute Error)</h4>
              <div className="bg-white p-4 rounded border border-blue-200 text-center">
                <p className="font-mono text-lg mb-2">MAE = (1/n) * Σ |Ri - Ri_hat|</p>
                <div className="text-left text-xs text-gray-500 space-y-1">
                  <p>
                    <strong>n</strong> : Jumlah total data test
                  </p>
                  <p>
                    <strong>Ri</strong> : Nilai rating aktual (sebenarnya)
                  </p>
                  <p>
                    <strong>Ri_hat</strong> : Nilai rating hasil prediksi
                  </p>
                  <p>
                    <strong>|...|</strong> : Nilai absolut (selisih positif)
                  </p>
                </div>
              </div>
            </div>

            {/* RMSE Formula */}
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Rumus RMSE (Root Mean Square Error)</h4>
              <div className="bg-white p-4 rounded border border-blue-200 text-center">
                <p className="font-mono text-lg mb-2">RMSE = √ [ (1/n) * Σ (Ri - Ri_hat)² ]</p>
                <div className="text-left text-xs text-gray-500 space-y-1">
                  <p>
                    <strong>n</strong> : Jumlah total data test
                  </p>
                  <p>
                    <strong>Ri</strong> : Nilai rating aktual
                  </p>
                  <p>
                    <strong>Ri_hat</strong> : Nilai rating hasil prediksi
                  </p>
                  <p>
                    <strong>(...)²</strong> : Kuadrat dari selisih error
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white">
          <Card.Body className="text-center py-8">
            <h3 className="text-lg font-medium opacity-90 mb-2">MAE (Mean Absolute Error)</h3>
            <p className="text-4xl font-bold mb-2">{evaluation ? evaluation.mae.toFixed(4) : "-"}</p>
            <p className="text-sm opacity-75">
              {evaluation?.interpretation ? evaluation.interpretation.split("-")[0] : ""}
            </p>
          </Card.Body>
        </Card>

        <Card className="bg-linear-to-br from-indigo-500 to-indigo-600 text-white">
          <Card.Body className="text-center py-8">
            <h3 className="text-lg font-medium opacity-90 mb-2">RMSE (Root Mean Square Error)</h3>
            <p className="text-4xl font-bold mb-2">{evaluation ? evaluation.rmse.toFixed(4) : "-"}</p>
            <p className="text-sm opacity-75">Root Mean Squared Error</p>
          </Card.Body>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-bold text-gray-900">Detail Evaluasi per User</h3>
        </Card.Header>
        <Card.Body>
          <Table headers={["User", "Rata-rata Error (MAE)", "Total Test Cases", "Status"]}>
            {userSummaries.map((detail, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <span className="font-medium text-gray-900">{detail.userName}</span>
                </Table.Cell>
                <Table.Cell>{detail.averageError.toFixed(4)}</Table.Cell>
                <Table.Cell>{detail.ratingsCount}</Table.Cell>
                <Table.Cell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      detail.averageError < 0.5
                        ? "bg-green-100 text-green-800"
                        : detail.averageError < 1.0
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {detail.averageError < 0.5 ? "Akurat" : detail.averageError < 1.0 ? "Cukup" : "Kurang"}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
            {userSummaries.length === 0 && !loading && (
              <Table.Row>
                <Table.Cell colSpan={4} className="text-center py-8">
                  No evaluation data available. Pastikan minimal ada 2 user dan beberapa rating.
                </Table.Cell>
              </Table.Row>
            )}
          </Table>
        </Card.Body>
      </Card>

      {evaluation && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-bold text-yellow-900 mb-2">Kesimpulan Evaluasi</h4>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>
              Total Data Uji: <strong>{evaluation.evaluatedRatings}</strong> rating (dari {evaluation.totalRatings}{" "}
              total rating)
            </p>
            <p>
              Interpretasi Hasil: <strong>{evaluation.interpretation}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
