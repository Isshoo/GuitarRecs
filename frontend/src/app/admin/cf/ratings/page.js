"use client";

import { useState, useEffect } from "react";
import { ratingAPI } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import Table from "@/components/ui/Table";
import Card from "@/components/ui/Card";
import RatingStars from "@/components/features/RatingStars";

export default function RatingsDataPage() {
  const [ratings, setRatings] = useState([]);
  const { loading, execute: fetchRatings } = useApi();

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    const result = await fetchRatings(ratingAPI.getAll);
    if (result.success) setRatings(result.data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Step 1: Data Rating</h1>
        <p className="text-gray-500">Data rating gitar yang diberikan oleh pengguna.</p>
      </div>

      <Card>
        <Card.Body>
          <Table headers={["User", "Gitar", "Jenis", "Body", "Senar", "Merek", "Harga", "Rata-rata"]}>
            {(() => {
              // Sort ratings by user name first to ensure they are grouped
              const sortedRatings = [...ratings].sort((a, b) => {
                const nameA = a.user?.name || "";
                const nameB = b.user?.name || "";
                return nameA.localeCompare(nameB);
              });

              return sortedRatings.map((rating, index) => {
                const isFirstOfUser = index === 0 || rating.user?.name !== sortedRatings[index - 1].user?.name;

                let rowSpan = 1;
                if (isFirstOfUser) {
                  for (let i = index + 1; i < sortedRatings.length; i++) {
                    if (sortedRatings[i].user?.name === rating.user?.name) {
                      rowSpan++;
                    } else {
                      break;
                    }
                  }
                }

                return (
                  <Table.Row key={rating.id}>
                    {isFirstOfUser && (
                      <Table.Cell rowSpan={rowSpan} className="align-top bg-white">
                        <span className="font-medium text-gray-900">{rating.user?.name}</span>
                      </Table.Cell>
                    )}
                    <Table.Cell>
                      <span className="font-medium text-gray-900">{rating.guitar?.name}</span>
                    </Table.Cell>
                    <Table.Cell>{rating.jenisGitar}</Table.Cell>
                    <Table.Cell>{rating.bahanBody}</Table.Cell>
                    <Table.Cell>{rating.jenisSenar}</Table.Cell>
                    <Table.Cell>{rating.merek}</Table.Cell>
                    <Table.Cell>{rating.harga}</Table.Cell>
                    <Table.Cell>
                      <RatingStars rating={rating.averageRating} size="sm" />
                    </Table.Cell>
                  </Table.Row>
                );
              });
            })()}
            {ratings.length === 0 && !loading && (
              <Table.Row>
                <Table.Cell colSpan={8} className="text-center py-8">
                  No ratings found
                </Table.Cell>
              </Table.Row>
            )}
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
