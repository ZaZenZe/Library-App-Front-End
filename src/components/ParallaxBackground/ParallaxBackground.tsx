// ============================================
// PARALLAX BACKGROUND COMPONENT
// ============================================

import { useEffect, useRef } from 'react';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import './ParallaxBackground.scss';

interface ParallaxBackgroundProps {
  activeLayer?: 1 | 2 | 3; // Which layer is currently active
}

export function ParallaxBackground({ activeLayer = 1 }: ParallaxBackgroundProps) {
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  
  // Mouse parallax effect (disabled on mobile)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const offset = useMouseParallax({ 
    maxOffset: 30, 
    smoothing: 0.1,
    disabled: isMobile 
  });

  // Apply parallax transforms to layers
  useEffect(() => {
    if (layer1Ref.current) {
      layer1Ref.current.style.transform = `translate(${offset.x * 0.5}px, ${offset.y * 0.5}px)`;
    }
    if (layer2Ref.current) {
      layer2Ref.current.style.transform = `translate(${offset.x * 1}px, ${offset.y * 1}px)`;
    }
    if (layer3Ref.current) {
      layer3Ref.current.style.transform = `translate(${offset.x * 1.5}px, ${offset.y * 1.5}px)`;
    }
  }, [offset]);

  return (
    <div className="parallax-background" role="presentation" aria-hidden="true">
      {/* Layer 1 - Hero Section Background */}
      <div 
        ref={layer1Ref}
        className={`parallax-background__layer parallax-background__layer--1 ${activeLayer === 1 ? 'active' : ''}`}
      >
        {/* SVG Grid Pattern */}
        <svg className="parallax-background__svg-pattern" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(46, 255, 211, 0.05)" strokeWidth="1" />
            </pattern>
            <pattern id="diagonal-lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 40 L 40 0" fill="none" stroke="rgba(46, 255, 211, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>

        {/* Floating Text Elements */}
        <div className="parallax-background__floating-terms parallax-background__floating-terms--1">
          <span>LIBRARY</span>
          <span>BOOKS</span>
          <span>AUTHORS</span>
          <span>STORIES</span>
          <span>PAGES</span>
          <span>CHAPTERS</span>
          <span>READING</span>
        </div>
      </div>

      {/* Layer 2 - Browse Books Section Background */}
      <div 
        ref={layer2Ref}
        className={`parallax-background__layer parallax-background__layer--2 ${activeLayer === 2 ? 'active' : ''}`}
      >
        {/* Dewey Decimal Numbers */}
        <div className="parallax-background__floating-terms parallax-background__floating-terms--2">
          <span>001.432</span>
          <span>823.914</span>
          <span>741.6</span>
          <span>100.5</span>
          <span>510.08</span>
          <span>200.1</span>
          <span>398.2</span>
          <span>978.1</span>
          <span>641.5</span>
          <span>808.02</span>
        </div>

        {/* Book-related Keywords */}
        <div className="parallax-background__keywords">
          <span>Fiction</span>
          <span>Non-Fiction</span>
          <span>Biography</span>
          <span>Mystery</span>
          <span>Romance</span>
          <span>Sci-Fi</span>
          <span>Fantasy</span>
          <span>Thriller</span>
          <span>History</span>
          <span>Poetry</span>
        </div>
      </div>

      {/* Layer 3 - Authors Section Background */}
      <div 
        ref={layer3Ref}
        className={`parallax-background__layer parallax-background__layer--3 ${activeLayer === 3 ? 'active' : ''}`}
      >
        {/* Literary Quotes */}
        <div className="parallax-background__quotes">
          <span>"To read is to voyage through time..."</span>
          <span>"Words are powerful..."</span>
          <span>"Every book is a world..."</span>
          <span>"Stories shape us..."</span>
          <span>"Literature is the mirror of humanity..."</span>
          <span>"In books we trust..."</span>
          <span>"Knowledge is power..."</span>
          <span>"Read more, worry less..."</span>
        </div>

        {/* Scattered Letters */}
        <div className="parallax-background__letters">
          <span>A</span>
          <span>B</span>
          <span>C</span>
          <span>D</span>
          <span>E</span>
          <span>F</span>
          <span>G</span>
          <span>H</span>
          <span>I</span>
          <span>J</span>
          <span>K</span>
          <span>L</span>
          <span>M</span>
          <span>N</span>
          <span>O</span>
          <span>P</span>
        </div>
      </div>
    </div>
  );
}
