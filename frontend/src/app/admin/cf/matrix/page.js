"use client";

import { useState, useEffect } from "react";
import { recommendationAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Table from "@/components/ui/Table";
import Card from "@/components/ui/Card";

export default function UserItemMatrixPage() {
  const [matrixData, setMatrixData] = useState({ users: [], guitars: [], matrix: {} });
  const { loading, execute: fetchMatrix } = useApi();

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    const result = await fetchMatrix(recommendationAPI.getUserItemMatrix);
    if (result.success) setMatrixData(result.data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Langkah 2: User-Item Matrix</h1>
        <p className="text-gray-500">Representasi data rating dalam bentuk matriks User x Item.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-x-auto">
          <Card.Body>
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                  >
                    User / Guitar
                  </th>
                  {matrixData.guitars.map((guitar) => (
                    <th
                      key={guitar.id}
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                    >
                      {guitar.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(matrixData.matrix) &&
                  matrixData.matrix.map((row) => (
                    <tr key={row.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r bg-gray-50">
                        {row.userName}
                      </td>
                      {matrixData.guitars.map((guitar) => {
                        const rating = row.ratings[guitar.id];
                        return (
                          <td key={guitar.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {rating !== null && rating !== undefined ? (
                              <span className="font-bold text-blue-600">{Number(rating).toFixed(2)}</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
