import { FiStar } from "react-icons/fi";

export default function RatingStars({ rating, max = 5, size = "md", interactive = false, onChange }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(star)}
          className={`focus:outline-none transition-transform ${
            interactive ? "hover:scale-110 cursor-pointer" : "cursor-default"
          }`}
        >
          <FiStar
            className={`
              ${sizes[size]} 
              ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              transition-colors
            `}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600 font-medium">{rating > 0 ? rating.toFixed(1) : ""}</span>
    </div>
  );
}
