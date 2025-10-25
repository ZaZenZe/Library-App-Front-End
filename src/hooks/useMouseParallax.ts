// ============================================
// MOUSE PARALLAX HOOK
// ============================================

import { useState, useEffect, useCallback } from 'react';

interface ParallaxOffset {
  x: number;
  y: number;
}

interface UseMouseParallaxOptions {
  maxOffset?: number; // Maximum pixel offset
  smoothing?: number; // Smoothing factor (0-1, lower = smoother)
  disabled?: boolean; // Disable parallax effect
}

/**
 * Custom hook for smooth mouse-tracking parallax effect
 * Tracks mouse position and returns X/Y offsets for parallax layers
 * 
 * @param options - Configuration options
 * @returns Parallax offset object with x and y values
 */
export function useMouseParallax(options: UseMouseParallaxOptions = {}): ParallaxOffset {
  const {
    maxOffset = 30,
    smoothing = 0.1,
    disabled = false,
  } = options;

  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });
  const [targetOffset, setTargetOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (disabled) return;

    // Calculate normalized position (-1 to 1)
    const normalizedX = (e.clientX / window.innerWidth - 0.5) * 2;
    const normalizedY = (e.clientY / window.innerHeight - 0.5) * 2;

    // Apply max offset
    setTargetOffset({
      x: normalizedX * maxOffset,
      y: normalizedY * maxOffset,
    });
  }, [maxOffset, disabled]);

  // Smooth animation loop
  useEffect(() => {
    if (disabled) {
      setOffset({ x: 0, y: 0 });
      setTargetOffset({ x: 0, y: 0 });
      return;
    }

    let animationFrameId: number;

    const animate = () => {
      setOffset(current => ({
        x: current.x + (targetOffset.x - current.x) * smoothing,
        y: current.y + (targetOffset.y - current.y) * smoothing,
      }));
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetOffset, smoothing, disabled]);

  // Add/remove event listener
  useEffect(() => {
    if (disabled) return;

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove, disabled]);

  return offset;
}
