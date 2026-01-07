"use client";

import { useState, useEffect } from "react";
import { userAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Table from "@/components/ui/Table";
import { FiTrash2 } from "react-icons/fi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const { loading, execute: fetchUsers } = useApi();
  const { execute: deleteUser } = useApi();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const result = await fetchUsers(userAPI.getAll);
    if (result.success) setUsers(result.data);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const result = await deleteUser(userAPI.delete, id);
      if (result.success) loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table headers={["Nama", "Email", "Role", "Bergabung", "Actions"]}>
          {users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>
                <span className="font-medium text-gray-900">{user.name}</span>
              </Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role}
                </span>
              </Table.Cell>
              <Table.Cell>{new Date(user.createdAt).toLocaleDateString()}</Table.Cell>
              <Table.Cell>
                {user.role !== "admin" && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete User"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
      </div>
    </div>
  );
}
