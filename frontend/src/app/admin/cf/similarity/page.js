"use client";

import { useState, useEffect } from "react";
import { recommendationAPI, userAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";

export default function SimilarityPage() {
  const [similarityData, setSimilarityData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { loading, execute: fetchSimilarity } = useApi();
  const { execute: fetchUsersData } = useApi();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadSimilarity(selectedUser);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    const result = await fetchUsersData(userAPI.getAll);
    if (result.success && result.data.length > 0) {
      setUsers(result.data);
      // Select first user by default
      const firstUser = result.data.find((u) => u.role !== "admin");
      if (firstUser) setSelectedUser(firstUser.id);
    }
  };

  const loadSimilarity = async (userId) => {
    const result = await fetchSimilarity(recommendationAPI.getSimilarity, userId);
    if (result.success) setSimilarityData(result.data.similarities);
  };

  const openDetail = (item) => {
    setSelectedDetail(item);
    setIsModalOpen(true);
  };

  const renderCalculationDetail = () => {
    if (!selectedDetail) return null;

    const { targetVector, otherVector } = selectedDetail;
    const dotProduct = targetVector.reduce((acc, val, i) => acc + val * otherVector[i], 0);
    const magA = Math.sqrt(targetVector.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(otherVector.reduce((acc, val) => acc + val * val, 0));

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-2">Rumus Cosine Similarity</h4>
          <p className="font-mono text-sm bg-white p-2 rounded border border-blue-200 text-center">
            Similarity = (A . B) / (||A|| * ||B||)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-gray-700">Vektor User A (Target)</h5>
            <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">[{targetVector.join(", ")}]</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-700">Vektor User B (Neighbor)</h5>
            <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">[{otherVector.join(", ")}]</p>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 border-b pb-2">Langkah Perhitungan:</h5>

          <div>
            <p className="text-sm text-gray-600">1. Dot Product (A . B)</p>
            <p className="font-mono text-sm">
              = {targetVector.map((v, i) => `(${v} * ${otherVector[i]})`).join(" + ")}
            </p>
            <p className="font-mono text-sm font-bold">= {dotProduct}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">2. Magnitude A (||A||)</p>
            <p className="font-mono text-sm">= √({targetVector.map((v) => `${v}²`).join(" + ")})</p>
            <p className="font-mono text-sm font-bold">
              = √{magA * magA} = {magA.toFixed(4)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">3. Magnitude B (||B||)</p>
            <p className="font-mono text-sm">= √({otherVector.map((v) => `${v}²`).join(" + ")})</p>
            <p className="font-mono text-sm font-bold">
              = √{magB * magB} = {magB.toFixed(4)}
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded border border-green-200 mt-4">
            <p className="text-sm text-green-800 font-medium">Hasil Akhir:</p>
            <p className="font-mono text-lg font-bold text-green-700">
              {dotProduct} / ({magA.toFixed(4)} * {magB.toFixed(4)}) = {selectedDetail.similarity.toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Langkah 3: Cosine Similarity</h1>
        <p className="text-gray-500">Menghitung tingkat kemiripan antar pengguna menggunakan Cosine Similarity.</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <span className="font-medium text-gray-700">Pilih Target User:</span>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border"
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

      <Card>
        <Card.Body>
          <Table
            headers={[
              // "User A (Target)",
              "User Neighbor",
              "Jumlah Irisan",
              "Nilai Similarity",
              "Interpretasi",
              "Aksi",
            ]}
          >
            {similarityData.map((item, index) => (
              <Table.Row key={index}>
                {/* <Table.Cell>
                  <span className="font-medium text-blue-600">
                    {users.find((u) => u.id === parseInt(selectedUser))?.name || "-"}
                  </span>
                </Table.Cell> */}
                <Table.Cell>
                  <span className="font-medium text-gray-900">{item.userName}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-gray-900">{item.commonGuitars} Item</span>
                </Table.Cell>
                <Table.Cell>
                  <span
                    className={`font-bold ${
                      item.similarity > 0.7
                        ? "text-green-600"
                        : item.similarity > 0.4
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {item.similarity.toFixed(4)}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  {item.similarity > 0.8
                    ? "Sangat Mirip"
                    : item.similarity > 0.5
                    ? "Cukup Mirip"
                    : item.similarity > 0.2
                    ? "Sedikit Mirip"
                    : "Tidak Mirip"}
                </Table.Cell>
                <Table.Cell>
                  <Button size="sm" variant="outline" onClick={() => openDetail(item)}>
                    Lihat Detail
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
            {similarityData.length === 0 && !loading && (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-8">
                  Tidak ada similarity scores yang ditemukan (mungkin belum ada rating yang sama)
                </Table.Cell>
              </Table.Row>
            )}
          </Table>
        </Card.Body>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Detail Perhitungan: ${users.find((u) => u.id === parseInt(selectedUser))?.name} vs ${
          selectedDetail?.userName
        }`}
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
