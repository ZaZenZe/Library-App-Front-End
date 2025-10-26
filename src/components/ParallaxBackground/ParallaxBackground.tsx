// ============================================
// PARALLAX BACKGROUND COMPONENT
// ============================================

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import type { Book, Author } from '../../types/api';
import './ParallaxBackground.scss';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ParallaxBackgroundProps {
  activeLayer?: 1 | 2 | 3; // Which layer is currently active
  books?: Book[]; // Pass books data from parent to avoid duplicate API calls
  authors?: Author[]; // Pass authors data from parent to avoid duplicate API calls
}

export function ParallaxBackground({ activeLayer = 1, books, authors }: ParallaxBackgroundProps) {
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const [currentLayer, setCurrentLayer] = useState<1 | 2 | 3>(1); // Always start with layer 1
  
  // Create repeated book/author names for scrolling effect
  const [bookNames, setBookNames] = useState<string[]>([]);
  const [authorNames, setAuthorNames] = useState<string[]>([]);
  
  useEffect(() => {
    if (books && books.length > 0) {
      // Repeat book titles to fill the screen
      const titles = books.map(book => book.title);
      const repeated = Array(10).fill(titles).flat();
      setBookNames(repeated);
    }
  }, [books]);
  
  useEffect(() => {
    if (authors && authors.length > 0) {
      // Repeat author names to fill the screen
      const names = authors.map(author => author.name);
      const repeated = Array(10).fill(names).flat();
      setAuthorNames(repeated);
    }
  }, [authors]);

  // Setup scroll-triggered layer activation
  useEffect(() => {
    // Only run on desktop/tablet (not mobile)
    if (window.innerWidth < 768) return;

    const triggers: ScrollTrigger[] = [];

    // Layer 1 - Active from top to books section
    const layer1Trigger = ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom center',
      onEnter: () => setCurrentLayer(1),
      onEnterBack: () => setCurrentLayer(1),
    });
    triggers.push(layer1Trigger);

    // Layer 2 - Active during books section
    const layer2Trigger = ScrollTrigger.create({
      trigger: '.books-section',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setCurrentLayer(2),
      onEnterBack: () => setCurrentLayer(2),
    });
    triggers.push(layer2Trigger);

    // Layer 3 - Active during authors section
    const layer3Trigger = ScrollTrigger.create({
      trigger: '.authors-section',
      start: 'top center',
      end: 'bottom bottom',
      onEnter: () => setCurrentLayer(3),
      onEnterBack: () => setCurrentLayer(3),
    });
    triggers.push(layer3Trigger);

    return () => {
      triggers.forEach(trigger => trigger.kill());
    };
  }, []);
  
  // Mouse parallax effect (disabled on mobile)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const offset = useMouseParallax({ 
    maxOffset: 20, // Reduced for smoother performance
    smoothing: 0.15,
    disabled: isMobile 
  });

  // Apply parallax transforms to layers with reduced intensity
  useEffect(() => {
    if (!isMobile) {
      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translate3d(${offset.x * 0.3}px, ${offset.y * 0.3}px, 0)`;
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate3d(${offset.x * 0.6}px, ${offset.y * 0.6}px, 0)`;
      }
      if (layer3Ref.current) {
        layer3Ref.current.style.transform = `translate3d(${offset.x * 0.9}px, ${offset.y * 0.9}px, 0)`;
      }
    }
  }, [offset, isMobile]);

  return (
    <div className="parallax-background" role="presentation" aria-hidden="true">
      {/* Layer 1 - Hero Section Background */}
      <div 
        ref={layer1Ref}
        className={`parallax-background__layer parallax-background__layer--1 ${currentLayer === 1 ? 'active' : ''}`}
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

        {/* Floating Text Elements - Static for Hero */}
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

      {/* Layer 2 - Browse Books Section Background - DYNAMIC SCROLLING BOOK NAMES */}
      <div 
        ref={layer2Ref}
        className={`parallax-background__layer parallax-background__layer--2 ${currentLayer === 2 ? 'active' : ''}`}
      >
        {/* Diagonal Scrolling Book Names */}
        <div className="parallax-background__scrolling-text parallax-background__scrolling-text--diagonal-1">
          {bookNames.length > 0 ? (
            bookNames.map((title, index) => (
              <span key={`book-diag1-${index}`}>{title}</span>
            ))
          ) : (
            // Fallback if no books loaded yet
            <>
              <span>The Great Gatsby</span>
              <span>1984</span>
              <span>To Kill a Mockingbird</span>
              <span>Pride and Prejudice</span>
              <span>The Catcher in the Rye</span>
              <span>Harry Potter</span>
              <span>Lord of the Rings</span>
              <span>The Hobbit</span>
            </>
          )}
        </div>

        {/* Second diagonal layer for depth */}
        <div className="parallax-background__scrolling-text parallax-background__scrolling-text--diagonal-2">
          {bookNames.length > 0 ? (
            bookNames.slice().reverse().map((title, index) => (
              <span key={`book-diag2-${index}`}>{title}</span>
            ))
          ) : (
            <>
              <span>Brave New World</span>
              <span>Animal Farm</span>
              <span>The Odyssey</span>
              <span>Moby Dick</span>
              <span>War and Peace</span>
              <span>The Divine Comedy</span>
              <span>Hamlet</span>
              <span>Fahrenheit 451</span>
            </>
          )}
        </div>

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
        </div>
      </div>

      {/* Layer 3 - Authors Section Background - DYNAMIC SCROLLING AUTHOR NAMES */}
      <div 
        ref={layer3Ref}
        className={`parallax-background__layer parallax-background__layer--3 ${currentLayer === 3 ? 'active' : ''}`}
      >
        {/* Horizontal Scrolling Author Names */}
        <div className="parallax-background__scrolling-text parallax-background__scrolling-text--horizontal-1">
          {authorNames.length > 0 ? (
            authorNames.map((name, index) => (
              <span key={`author-h1-${index}`}>{name}</span>
            ))
          ) : (
            <>
              <span>William Shakespeare</span>
              <span>Jane Austen</span>
              <span>Charles Dickens</span>
              <span>Ernest Hemingway</span>
              <span>Virginia Woolf</span>
              <span>James Joyce</span>
              <span>F. Scott Fitzgerald</span>
              <span>Gabriel García Márquez</span>
            </>
          )}
        </div>

        {/* Vertical Scrolling Author Names */}
        <div className="parallax-background__scrolling-text parallax-background__scrolling-text--vertical-1">
          {authorNames.length > 0 ? (
            authorNames.slice().reverse().map((name, index) => (
              <span key={`author-v1-${index}`}>{name}</span>
            ))
          ) : (
            <>
              <span>Leo Tolstoy</span>
              <span>Fyodor Dostoevsky</span>
              <span>Herman Melville</span>
              <span>Mark Twain</span>
              <span>George Orwell</span>
              <span>Harper Lee</span>
              <span>J.K. Rowling</span>
              <span>J.R.R. Tolkien</span>
            </>
          )}
        </div>

        {/* Literary Quotes */}
        <div className="parallax-background__quotes">
          <span>"To read is to voyage through time..."</span>
          <span>"Words are powerful..."</span>
          <span>"Every book is a world..."</span>
          <span>"Stories shape us..."</span>
        </div>
      </div>
    </div>
  );
}
