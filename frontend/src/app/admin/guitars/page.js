"use client";

import { useState, useEffect } from "react";
import { guitarAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { FiEdit2, FiTrash2, FiPlus, FiInfo } from "react-icons/fi";

const GUITAR_OPTIONS = {
  types: ["Akustik", "Klasik"],
  bodyTypes: ["Dreadnought", "Concert/Grand", "Standard", "Narrow Nut Classical"],
  strings: ["Phosphor Bronze", "Nilon Tension Normal"],
  brands: ["Yamaha", "Córdoba", "Cort"],
};

export default function GuitarManagement() {
  const [guitars, setGuitars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: GUITAR_OPTIONS.brands[0],
    type: GUITAR_OPTIONS.types[0],
    bodyType: GUITAR_OPTIONS.bodyTypes[0],
    strings: GUITAR_OPTIONS.strings[0],
    price: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState(null);

  const { loading, execute: fetchGuitars } = useApi();
  const { execute: saveGuitar, loading: saving } = useApi();
  const { execute: deleteGuitar } = useApi();

  useEffect(() => {
    loadGuitars();
  }, []);

  const loadGuitars = async () => {
    const result = await fetchGuitars(guitarAPI.getAll);
    if (result.success) setGuitars(result.data);
  };

  const handleOpenModal = (guitar = null) => {
    if (guitar) {
      setEditingId(guitar.id);
      setFormData({
        name: guitar.name,
        brand: guitar.brand,
        type: guitar.type,
        bodyType: guitar.bodyType,
        strings: guitar.strings,
        price: guitar.price,
        imageUrl: guitar.imageUrl || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        brand: GUITAR_OPTIONS.brands[0],
        type: GUITAR_OPTIONS.types[0],
        bodyType: GUITAR_OPTIONS.bodyTypes[0],
        strings: GUITAR_OPTIONS.strings[0],
        price: "",
        imageUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, errorMessage: "" }));

    const data = {
      ...formData,
      price: parseInt(formData.price),
    };

    let result;
    if (editingId) {
      result = await saveGuitar(guitarAPI.update, editingId, data);
    } else {
      result = await saveGuitar(guitarAPI.create, data);
    }

    if (result.success) {
      setIsModalOpen(false);
      loadGuitars();
    } else {
      // Show error message from backend
      setFormData((prev) => ({ ...prev, errorMessage: result.error || "Terjadi kesalahan saat menyimpan data." }));
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this guitar?")) {
      const result = await deleteGuitar(guitarAPI.delete, id);
      if (result.success) {
        loadGuitars();
      } else {
        alert(result.message || "Gagal menghapus data");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value, errorMessage: "" });
  };

  const renderSelect = (id, label, options) => (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
        value={formData[id]}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Gitar</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsMasterDataOpen(true)} variant="outline" className="flex items-center gap-2">
            <FiInfo className="w-4 h-4" /> Master Data
          </Button>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Tambah Gitar
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table headers={["Kode", "Nama", "Jenis Gitar", "Bahan Body", "Jenis Senar", "Merek", "Harga", "Aksi"]}>
          {guitars.map((guitar, index) => (
            <Table.Row key={guitar.id}>
              <Table.Cell>
                <span className="font-medium text-gray-900">G{index + 1}</span>
              </Table.Cell>
              <Table.Cell>
                <span className="font-medium text-gray-900">{guitar.name}</span>
              </Table.Cell>
              <Table.Cell>{guitar.type}</Table.Cell>
              <Table.Cell>{guitar.bodyType}</Table.Cell>
              <Table.Cell>{guitar.strings}</Table.Cell>
              <Table.Cell>{guitar.brand}</Table.Cell>
              <Table.Cell>Rp {guitar.price.toLocaleString("id-ID")}</Table.Cell>
              <Table.Cell>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(guitar)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(guitar.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
          {guitars.length === 0 && !loading && (
            <Table.Row>
              <Table.Cell colSpan={7} className="text-center py-8">
                No guitars found
              </Table.Cell>
            </Table.Row>
          )}
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Gitar" : "Tambah Gitar Baru"}
        size="lg"
      >
        {formData.errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{formData.errorMessage}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="name" label="Nama Gitar" value={formData.name} onChange={handleChange} required />

            {renderSelect("brand", "Merek", GUITAR_OPTIONS.brands)}
            {renderSelect("type", "Tipe", GUITAR_OPTIONS.types)}
            {renderSelect("bodyType", "Bentuk Body", GUITAR_OPTIONS.bodyTypes)}
            {renderSelect("strings", "Jenis Senar", GUITAR_OPTIONS.strings)}

            <Input
              id="price"
              label="Harga (Rp)"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
            />

            <Input id="imageUrl" label="URL Gambar (Opsional)" value={formData.imageUrl} onChange={handleChange} />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={saving}>
              {editingId ? "Simpan Perubahan" : "Tambah Gitar"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isMasterDataOpen}
        onClose={() => setIsMasterDataOpen(false)}
        title="Master Data Kriteria"
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                  Kriteria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nilai Kriteria
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {/* Jenis Gitar */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900 border-r align-top" rowSpan={2}>
                  Jenis gitar (K1)
                </td>
                <td className="px-6 py-2">1 - Akustik</td>
              </tr>
              <tr>
                <td className="px-6 py-2">2 - Klasik</td>
              </tr>

              {/* Bahan Body */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 border-r align-top" rowSpan={4}>
                  Bahan body (K2)
                </td>
                <td className="px-6 py-2">1 - Dreadnought</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-2">2 - Concert/Grand</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-2">3 - Standard</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-2">4 - Narrow Nut Classical</td>
              </tr>

              {/* Jenis Senar */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900 border-r align-top" rowSpan={2}>
                  Jenis senar (K3)
                </td>
                <td className="px-6 py-2">1 - Phosphor Bronze</td>
              </tr>
              <tr>
                <td className="px-6 py-2">2 - Nilon Tension Normal</td>
              </tr>

              {/* Merek */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 border-r align-top" rowSpan={3}>
                  Merek (K4)
                </td>
                <td className="px-6 py-2">1 - Yamaha</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-2">2 - Córdoba</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-2">3 - Cort</td>
              </tr>

              {/* Harga */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900 border-r align-top" rowSpan={4}>
                  Harga (K5)
                </td>
                <td className="px-6 py-2">1 - &lt;= Rp 749.999</td>
              </tr>
              <tr>
                <td className="px-6 py-2">2 - Rp 750.000 – 999.999</td>
              </tr>
              <tr>
                <td className="px-6 py-2">3 - Rp 1.000.000 – 1.249.999</td>
              </tr>
              <tr>
                <td className="px-6 py-2">4 - &gt;= Rp 1.250.000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
