"use client";

import { useState, useEffect } from "react";
import { guitarAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

export default function GuitarManagement() {
  const [guitars, setGuitars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "Akustik",
    bodyType: "",
    strings: "",
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
        brand: "",
        type: "Akustik",
        bodyType: "",
        strings: "",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Gitar</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Tambah Gitar
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table headers={["Nama", "Merek", "Tipe", "Harga", "Actions"]}>
          {guitars.map((guitar) => (
            <Table.Row key={guitar.id}>
              <Table.Cell>
                <span className="font-medium text-gray-900">{guitar.name}</span>
              </Table.Cell>
              <Table.Cell>{guitar.brand}</Table.Cell>
              <Table.Cell>{guitar.type}</Table.Cell>
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
              <Table.Cell colSpan={5} className="text-center py-8">
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
            <Input id="brand" label="Merek" value={formData.brand} onChange={handleChange} required />

            <div className="w-full">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipe
              </label>
              <select
                id="type"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="Akustik">Akustik</option>
                <option value="Klasik">Klasik</option>
              </select>
            </div>

            <Input id="bodyType" label="Bentuk Body" value={formData.bodyType} onChange={handleChange} required />
            <Input id="strings" label="Jenis Senar" value={formData.strings} onChange={handleChange} required />
            <Input
              id="price"
              label="Harga (Rp)"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
            />

            {/* Price Range is now automatically calculated */}
            <Input id="imageUrl" label="URL Gambar (Opsional)" value={formData.imageUrl} onChange={handleChange} />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={saving}>
              {editingId ? "Simpan Perubahan" : "Tambah Gitar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
