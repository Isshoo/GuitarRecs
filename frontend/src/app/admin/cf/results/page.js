"use client";

import { useState, useEffect } from "react";
import { recommendationAPI, userAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Table from "@/components/ui/Table";
import Card from "@/components/ui/Card";

export default function ResultsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const { loading, execute: fetchRecommendations } = useApi();
  const { execute: fetchUsersData } = useApi();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadRecommendations(selectedUser);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    const result = await fetchUsersData(userAPI.getUsersWithPendingPredictions);
    if (result.success && result.data.length > 0) {
      setUsers(result.data);
      if (result.data.length > 0) setSelectedUser(result.data[0].id);
    }
  };

  const loadRecommendations = async (userId) => {
    // Pass topN=-1 to get ALL recommendations
    const result = await fetchRecommendations(recommendationAPI.getRecommendationsForUser, userId, { topN: -1 });
    if (result.success) setRecommendations(result.data.recommendations);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Sangat Direkomendasikan":
        return "bg-green-100 text-green-800";
      case "Direkomendasikan":
        return "bg-blue-100 text-blue-800";
      case "Cukup Direkomendasikan":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Step 6: Recommendation Results</h1>
        <p className="text-gray-500">
          Hasil akhir rekomendasi untuk user setelah diurutkan berdasarkan prediksi rating tertinggi.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border w-full md:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Target User</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        {users.length === 0 && !loading && (
          <p className="text-sm text-red-500 mt-2">Semua user sudah mendapatkan rekomendasi atau tidak ada data.</p>
        )}
      </div>

      <Card>
        <Card.Body>
          <Table headers={["Rank", "Guitar Name", "Predicted Rating", "Status"]}>
            {recommendations.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0
                        ? "bg-yellow-500 shadow-md"
                        : index === 1
                        ? "bg-gray-400 shadow-sm"
                        : index === 2
                        ? "bg-orange-400 shadow-sm"
                        : "bg-blue-200 text-blue-800"
                    }`}
                  >
                    {item.rank}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{item.guitarName}</span>
                    <span className="text-xs text-gray-500">ID: {item.guitarId}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl text-blue-600">{item.predictedRating.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">/ 5.00</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
            {recommendations.length === 0 && !loading && (
              <Table.Row>
                <Table.Cell colSpan={4} className="text-center py-8 text-gray-500">
                  {selectedUser ? "Tidak ada rekomendasi tersedia." : "Silakan pilih user untuk melihat rekomendasi."}
                </Table.Cell>
              </Table.Row>
            )}
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
