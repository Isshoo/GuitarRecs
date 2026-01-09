"use client";

import { useState, useEffect } from "react";
import { recommendationAPI, userAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Table from "@/components/ui/Table";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function PredictionPage() {
  const [predictions, setPredictions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [kValue, setKValue] = useState(3);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const { loading, execute: fetchPredictions } = useApi();
  const { execute: fetchData } = useApi();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadPredictions(selectedUser);
    } else {
      setPredictions([]);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    const kRes = await fetchData(recommendationAPI.getKConfig);
    if (kRes.success) setKValue(parseInt(kRes.data.k));

    const usersRes = await fetchData(userAPI.getUsersWithPendingPredictions);
    if (usersRes.success) {
      setUsers(usersRes.data);
      if (usersRes.data.length > 0) setSelectedUser(usersRes.data[0].id);
      else setSelectedUser("");
    }
  };

  const loadPredictions = async (userId) => {
    const result = await fetchPredictions(recommendationAPI.getAllPredictions, userId, kValue);
    if (result.success) {
      setPredictions(result.data.predictions);
    }
  };

  const openDetail = (prediction) => {
    setSelectedDetail(prediction);
    setIsModalOpen(true);
  };

  const renderCalculationDetail = () => {
    if (!selectedDetail) return null;

    const { guitarName, predictedRating, numerator, denominator, details } = selectedDetail;

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-2">Rumus Weighted Average</h4>
          <p className="font-mono text-sm bg-white p-2 rounded border border-blue-200 text-center">
            P = Σ(Similarity * Rating) / Σ(|Similarity|)
          </p>
        </div>

        <div className="space-y-4">
          <h5 className="font-medium text-gray-900 border-b pb-2">Detail Neighbor yang Menilai "{guitarName}"</h5>
          <Table headers={["Neighbor", "Similarity (S)", "Rating (R)", "S * R"]}>
            {details.map((n, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>{n.userName}</Table.Cell>
                <Table.Cell>{n.similarity.toFixed(4)}</Table.Cell>
                <Table.Cell>{n.rating}</Table.Cell>
                <Table.Cell>{n.weighted.toFixed(4)}</Table.Cell>
              </Table.Row>
            ))}
          </Table>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm text-gray-500">Total Pembilang (Numerator)</p>
              <p className="font-mono font-bold text-lg">Σ(S*R) = {numerator}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm text-gray-500">Total Penyebut (Denominator)</p>
              <p className="font-mono font-bold text-lg">Σ(S) = {denominator}</p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded border border-green-200 mt-4 text-center">
            <p className="text-sm text-green-800 font-medium mb-1">Hasil Prediksi Akhir:</p>
            <p className="font-mono text-xl font-bold text-green-700">
              {numerator} / {denominator} = {predictedRating?.toFixed(2) ?? "N/A"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Langkah 5: Prediksi Rating</h1>
        <p className="text-gray-500">Menghitung prediksi rating untuk semua item yang belum dinilai target user.</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <span className="font-medium text-gray-700">Pilih Target User:</span>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        {loading && <span className="text-sm text-gray-500 animate-pulse">Calculating predictions...</span>}
      </div>

      <Card>
        <Card.Body>
          <Table headers={["Item (Gitar)", "Prediksi Rating", "Status", "Aksi"]}>
            {predictions.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <span className="font-medium text-gray-900">{item.guitarName}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-bold text-blue-600 text-lg">
                    {item.predictedRating ? item.predictedRating.toFixed(2) : "N/A"}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  {item.predictedRating ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Cannot Predict
                    </span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {item.predictedRating && (
                    <Button size="sm" variant="outline" onClick={() => openDetail(item)}>
                      Lihat Detail
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
            {predictions.length === 0 && !loading && (
              <Table.Row>
                <Table.Cell colSpan={4} className="text-center py-8 text-gray-500">
                  Tidak ada prediksi yang ditemukan (mungkin belum ada rating yang sama)
                </Table.Cell>
              </Table.Row>
            )}
          </Table>
        </Card.Body>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Detail Prediksi: ${selectedDetail?.guitarName}`}
        size="lg"
      >
        {renderCalculationDetail()}
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setIsModalOpen(false)}>Tutup</Button>
        </div>
      </Modal>
    </div>
  );
}
