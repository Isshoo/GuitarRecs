"use client";

import { useState, useEffect } from "react";
import { recommendationAPI, userAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Table from "@/components/ui/Table";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NeighborsPage() {
  const [neighbors, setNeighbors] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [kValue, setKValue] = useState(3);

  const { loading, execute: fetchNeighbors } = useApi();
  const { execute: fetchUsersData } = useApi();
  const { execute: updateK } = useApi();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadNeighbors(selectedUser, kValue);
    }
  }, [selectedUser, kValue]);

  const loadInitialData = async () => {
    const [usersRes, kRes] = await Promise.all([
      fetchUsersData(userAPI.getAll),
      fetchUsersData(recommendationAPI.getKConfig),
    ]);

    if (usersRes.success && usersRes.data.length > 0) {
      setUsers(usersRes.data);
      const firstUser = usersRes.data.find((u) => u.role !== "admin");
      if (firstUser) setSelectedUser(firstUser.id);
    }

    if (kRes.success) {
      setKValue(parseInt(kRes.data.k));
    }
  };

  const loadNeighbors = async (userId, k) => {
    const result = await fetchNeighbors(recommendationAPI.getNearestNeighbors, userId, k);
    if (result.success) setNeighbors(result.data.neighbors);
  };

  const handleKChange = async (newK) => {
    const k = parseInt(newK);
    setKValue(k);
    // Also update backend config
    await updateK(recommendationAPI.setKConfig, k);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Langkah 4: Nearest Neighbors</h1>
        <p className="text-gray-500">Menentukan K tetangga terdekat berdasarkan skor similaritas tertinggi.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <span className="font-medium text-gray-700">Pilih Target User:</span>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border grow"
          >
            {users
              .filter((u) => u.role !== "admin")
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto border-l pl-0 md:pl-4">
          <span className="font-medium text-gray-700">Nilai K (Tetangga):</span>
          <input
            type="number"
            min="1"
            max="10"
            value={kValue}
            onChange={(e) => handleKChange(e.target.value)}
            className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border"
          />
          <span className="text-xs text-gray-500 italic">(Otomatis disimpan)</span>
        </div>
      </div>

      <Card>
        <Card.Body>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top {kValue} Neighbors untuk User Terpilih</h3>
          <Table headers={["Rank", "User Neighbor", "Nilai Similarity", "Status"]}>
            {neighbors.map((neighbor, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-medium text-gray-900">{neighbor.userName}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-bold text-blue-600">{neighbor.similarity.toFixed(4)}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Selected
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
            {neighbors.length === 0 && !loading && (
              <Table.Row>
                <Table.Cell colSpan={4} className="text-center py-8">
                  Tidak ada neighbor yang ditemukan (mungkin belum ada rating yang sama)
                </Table.Cell>
              </Table.Row>
            )}
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
