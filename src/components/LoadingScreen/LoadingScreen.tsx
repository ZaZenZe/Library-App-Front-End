// ============================================
// LOADING SCREEN COMPONENT
// ============================================

import { useEffect, useState } from 'react';
import { useFontCycle } from '../../hooks/useFontCycle';
import './LoadingScreen.scss';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  duration?: number; // Duration in milliseconds
}

export function LoadingScreen({ 
  onLoadingComplete, 
  duration = 2500 
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  
  // Font cycling for "LOADING LIBRARY..." text
  const cyclingFont = useFontCycle({ interval: 500 });

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Accelerate progress towards the end
        const increment = prev < 50 ? 2 : prev < 80 ? 3 : 5;
        return Math.min(prev + increment, 100);
      });
    }, duration / 50); // 50 steps

    return () => clearInterval(progressInterval);
  }, [duration]);

  useEffect(() => {
    if (progress === 100) {
      // Wait a bit after reaching 100% before fading out
      setTimeout(() => {
        setIsComplete(true);
        
        // Start fade-out animation
        setTimeout(() => {
          setShouldHide(true);
          
          // Call completion callback after fade-out
          setTimeout(() => {
            onLoadingComplete?.();
          }, 800); // Match fade-out duration
        }, 300);
      }, 400);
    }
  }, [progress, onLoadingComplete]);

  if (shouldHide) return null;

  return (
    <div 
      className={`loading-screen ${isComplete ? 'loading-screen--complete' : ''}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading library"
    >
      {/* Background Gradient Orbs */}
      <div className="loading-screen__bg-orb loading-screen__bg-orb--1" />
      <div className="loading-screen__bg-orb loading-screen__bg-orb--2" />
      <div className="loading-screen__bg-orb loading-screen__bg-orb--3" />

      {/* Main Content */}
      <div className="loading-screen__content">
        {/* Circular Visualizer */}
        <div className="loading-screen__visualizer">
          {/* Outer Ring */}
          <svg className="loading-screen__ring loading-screen__ring--outer" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#gradient-outer)"
              strokeWidth="2"
              strokeDasharray="565"
              strokeDashoffset={565 - (565 * progress) / 100}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient-outer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-teal)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Middle Ring */}
          <svg className="loading-screen__ring loading-screen__ring--middle" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="url(#gradient-middle)"
              strokeWidth="3"
              strokeDasharray="440"
              strokeDashoffset={440 - (440 * progress) / 100}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient-middle" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner Ring */}
          <svg className="loading-screen__ring loading-screen__ring--inner" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="50"
              fill="none"
              stroke="url(#gradient-inner)"
              strokeWidth="4"
              strokeDasharray="314"
              strokeDashoffset={314 - (314 * progress) / 100}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient-inner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Percentage */}
          <div className="loading-screen__percentage">
            {progress}%
          </div>
        </div>

        {/* Loading Text with Font Cycling */}
        <h2 
          className="loading-screen__text"
          style={{ fontFamily: cyclingFont }}
        >
          LOADING LIBRARY...
        </h2>

        {/* Progress Bar */}
        <div className="loading-screen__progress-bar">
          <div 
            className="loading-screen__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Decorative Dots */}
        <div className="loading-screen__dots">
          <span className="loading-screen__dot" />
          <span className="loading-screen__dot" />
          <span className="loading-screen__dot" />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
