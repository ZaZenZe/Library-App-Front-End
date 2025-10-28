// ============================================
// LOADING SCREEN COMPONENT
// ============================================


import { useEffect, useState, useRef } from 'react';
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
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [tickerText, setTickerText] = useState('');
  const tickerRef = useRef<HTMLDivElement>(null);
  // Font cycling for headline
  const cyclingFont = useFontCycle({ interval: 700 });

// Newspaper/journal headlines (move outside component for stable reference)
const headlines = [
  'THE DIGITAL LIBRARY JOURNAL',
  'BREAKING: NEW BOOKS ARRIVE',
  'AUTHORS IN THE SPOTLIGHT',
  'CURATE YOUR COLLECTION',
  'ARCHIVING KNOWLEDGE SINCE 2025',
];
// Ticker lines (like news tickers)
const tickerLines = [
  'Loading catalog... ',
  'Fetching latest books... ',
  'Indexing authors... ',
  'Organizing shelves... ',
  'Preparing reading room... ',
  'Almost ready! ',
];

  // Animate progress bar (120fps)
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const total = duration;
    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const percent = Math.min(100, Math.round((elapsed / total) * 100));
      setProgress(percent);
      if (percent < 100) {
        frame = requestAnimationFrame(animate);
      }
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  // Cycle headlines every 1.2s
  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setHeadlineIndex((i) => (i + 1) % headlines.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isComplete, headlines.length]);

  // Animate ticker (typewriter effect)
  useEffect(() => {
    if (isComplete) return;
    let tickerIdx = 0;
    let charIdx = 0;
  let timeout: number;
    function typeNext() {
      const line = tickerLines[tickerIdx % tickerLines.length];
      setTickerText(line.slice(0, charIdx));
      if (charIdx < line.length) {
        charIdx++;
        timeout = setTimeout(typeNext, 18); // ~120fps
      } else {
        charIdx = 0;
        tickerIdx++;
        timeout = setTimeout(typeNext, 600);
      }
    }
    typeNext();
    return () => clearTimeout(timeout);
  }, [isComplete]);

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
      className={`loading-screen loading-screen--newspaper ${isComplete ? 'loading-screen--complete' : ''}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading library"
    >
      {/* Newspaper background pattern */}
      <div className="loading-screen__newspaper-bg" />
      <div className="loading-screen__content loading-screen__content--newspaper">
        {/* Animated Headline */}
        <div className="loading-screen__headline" style={{ fontFamily: cyclingFont }}>
          {headlines[headlineIndex]}
        </div>
        {/* Ticker (typewriter) */}
        <div className="loading-screen__ticker" ref={tickerRef}>
          <span className="loading-screen__ticker-label">NEWS</span>
          <span className="loading-screen__ticker-text">{tickerText}</span>
        </div>
        {/* Progress Bar */}
        <div className="loading-screen__progress-bar loading-screen__progress-bar--newspaper">
          <div
            className="loading-screen__progress-fill"
            style={{ width: `${progress}%` }}
          />
          <div className="loading-screen__progress-text">
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
