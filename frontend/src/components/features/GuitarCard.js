import { FiStar, FiUser, FiInfo } from "react-icons/fi";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Link from "next/link";

export default function GuitarCard({ guitar, showRating = true }) {
  // Format price to IDR
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      {/* Image Placeholder */}
      <div className="h-48 bg-gray-200 w-full flex items-center justify-center relative overflow-hidden">
        {guitar.imageUrl ? (
          <img src={guitar.imageUrl} alt={guitar.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <FiMusic className="w-12 h-12 mb-2" />
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Badge for Type */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-semibold text-gray-700 shadow-sm uppercase tracking-wider">
          {guitar.type}
        </div>
      </div>

      <Card.Body className="grow flex flex-col p-4">
        <div className="mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{guitar.brand}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">{guitar.name}</h3>

        <div className="space-y-1 text-sm text-gray-500 mb-4 grow">
          <p>{guitar.bodyType}</p>
          <p className="text-xs">{guitar.strings}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-gray-900">{formatPrice(guitar.price)}</span>
          {showRating && guitar.averageRating > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <FiStar className="fill-current w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">{guitar.averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({guitar.totalRatings || 0})</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <Link href={`/guitars/${guitar.id}`} className="block">
            <Button variant="outline" className="w-full text-sm">
              Lihat Detail
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}

// Icon helper
import { FiMusic } from "react-icons/fi";
