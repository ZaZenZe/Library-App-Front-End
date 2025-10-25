// ============================================
// useTextCycle Hook
// Cycles through an array of text strings
// ============================================

import { useState, useEffect } from 'react';

interface UseTextCycleOptions {
  interval?: number;
  enabled?: boolean;
}

export function useTextCycle(
  texts: string[],
  options: UseTextCycleOptions = {}
): string {
  const { interval = 3000, enabled = true } = options;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!enabled || texts.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [texts.length, interval, enabled]);

  return texts[currentIndex] || '';
}
