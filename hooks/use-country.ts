'use client';

import { useState, useEffect } from 'react';

export function useCountry() {
  const [country, setCountry] = useState<string>('SA'); // Default fallback

  useEffect(() => {
    // Read the user_country cookie from document.cookie set by middleware
    const match = document.cookie.match(/(?:^|; )user_country=([^;]*)/);
    if (match && match[1]) {
      setCountry(match[1]);
    }
  }, []);

  return country;
}
