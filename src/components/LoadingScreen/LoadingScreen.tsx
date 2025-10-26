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
        {/* Book Stack Animation */}
        <div className="loading-screen__book-stack">
          <div className="loading-screen__book loading-screen__book--1">
            <div className="book-spine"></div>
          </div>
          <div className="loading-screen__book loading-screen__book--2">
            <div className="book-spine"></div>
          </div>
          <div className="loading-screen__book loading-screen__book--3">
            <div className="book-spine"></div>
          </div>
          <div className="loading-screen__book loading-screen__book--4">
            <div className="book-spine"></div>
          </div>
        </div>

        {/* Library Logo/Icon */}
        <div className="loading-screen__icon">
          📚
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
          <div className="loading-screen__progress-text">
            {progress}%
          </div>
        </div>

        {/* Fun Loading Messages */}
        <p className="loading-screen__subtitle">
          {progress < 30 && "Opening the catalog..."}
          {progress >= 30 && progress < 60 && "Dusting off the shelves..."}
          {progress >= 60 && progress < 90 && "Organizing by Dewey Decimal..."}
          {progress >= 90 && "Almost ready to browse!"}
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;
