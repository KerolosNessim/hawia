"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function RatingSection() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [count, setCount] = useState(1); // عدد التقييمات
  const average = 5; // ثابت زي الصورة (غيره بالداتا الحقيقية)

  return (
    <div className="text-center py-10">
      {/* Title */}
      <h2 className="text-2xl font-bold mb-3 text-gray-900">
        كيف كان هذا المحتوى؟
      </h2>

      <p className="mb-6 text-gray-600">انقر على النجوم للتقييم!</p>

      {/* Stars */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
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

      {/* Result */}
      <p className="text-gray-700">
        متوسط التقييم: <span className="font-bold">{average} / 5</span> عدد
        التقييمات: <span className="font-bold underline">{count}</span>
      </p>
    </div>
  );
}
