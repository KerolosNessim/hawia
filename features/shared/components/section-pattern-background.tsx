"use client";

import { useId } from "react";

export default function SectionPatternBackground() {
  const patternId = useId();

  return (
    <div className="pointer-events-none absolute inset-0 text-brand opacity-5">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 50 Q 25 25, 50 50 T 100 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
