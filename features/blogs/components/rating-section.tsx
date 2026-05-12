"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RatingSection() {
  const t = useTranslations("blogDetail");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [count, setCount] = useState(1);
  const average = 5;
  const maxStars = 5;
  
  return null;

  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-bold mb-3 text-gray-900">
        {t("ratingTitle")}
      </h2>

      <p className="mb-6 text-gray-600">{t("ratingHint")}</p>

      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              setRating(star);
              setCount((prev) => prev + 1);
            }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              size={40}
              className={`transition ${
                (hover || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <p className="text-gray-700">
        {t("averageRating", { average, max: maxStars })}{" "}
        <span className="font-bold underline">
          {t("ratingsCount", { count })}
        </span>
      </p>
    </div>
  );
}
