import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Atur timer untuk memperbarui nilai setelah jeda (delay) selesai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Batalkan timer sebelumnya jika user mengetik lagi sebelum delay habis
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
