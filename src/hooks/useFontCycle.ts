// ============================================
// FONT CYCLE HOOK
// ============================================

import { useState, useEffect } from 'react';

const CYCLING_FONTS = [
  "'Bangers', cursive",
  "'Monoton', cursive",
  "'Rubik Glitch', cursive",
  "'Concert One', cursive",
  "'Orbitron', sans-serif",
  "'Press Start 2P', cursive",
  "'Oswald', sans-serif",
];

interface UseFontCycleOptions {
  interval?: number; // Interval in milliseconds
  fonts?: string[]; // Custom font array
  enabled?: boolean; // Enable/disable cycling
}

/**
 * Custom hook for cycling through fonts at a specified interval
 * Creates visual variety and personality in text elements
 * 
 * @param options - Configuration options
 * @returns Current font family string
 */
export function useFontCycle(options: UseFontCycleOptions = {}): string {
  const {
    interval = 500,
    fonts = CYCLING_FONTS,
    enabled = true,
  } = options;

  const [currentFontIndex, setCurrentFontIndex] = useState(0);

  useEffect(() => {
    if (!enabled || fonts.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentFontIndex((prevIndex) => (prevIndex + 1) % fonts.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval, fonts.length, enabled]);

  return enabled ? fonts[currentFontIndex] : fonts[0] || 'inherit';
}
