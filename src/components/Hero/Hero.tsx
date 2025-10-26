// ============================================
// HERO SECTION COMPONENT
// Cinematic intro with typographic emphasis
// ============================================

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useTextCycle } from '../../hooks/useTextCycle';
import './Hero.scss';

const TAGLINES = [
  'Discover Your Next Great Read',
  'Explore Endless Stories',
  'Your Digital Library Awaits',
  'Where Words Come Alive',
  'Curate Your Literary Journey',
];

const SCROLL_LOOP_TEXT = 'scroll down • discover • explore • ';

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const currentTagline = useTextCycle(TAGLINES, { interval: 3000 });

  // Cinematic intro animation
  useEffect(() => {
    if (!titleRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'power2.out',
        }
      });

      // Title entrance: scale + fade
      tl.from('.hero__title', {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });

      // Logo animation
      tl.from('.hero__logo', {
        scale: 0,
        rotate: -180,
        duration: 1.2,
        ease: 'back.out(1.7)',
      }, '-=1.0');

      // Subtitle fade in
      tl.from(
        '.hero__subtitle',
        {
          y: 30,
          opacity: 0,
          duration: 0.8,
        },
        '-=0.4'
      );

      // Scroll indicator - explicitly set to visible
      tl.to(
        '.hero__scroll-indicator',
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
        },
        '-=0.2'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleScrollDown = () => {
    const nextSection = document.querySelector('.books-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.section
      ref={heroRef}
      className="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="hero__content">
        {/* Logo Image */}
        <motion.div 
          className="hero__logo"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: "backOut",
            delay: 0.2 
          }}
        >
          <img 
            src="/library_rsde.png" 
            alt="Library Logo" 
            className="hero__logo-image"
          />
        </motion.div>

        {/* Main Title */}
        <h1 ref={titleRef} className="hero__title">
          <span className="hero__title-line">DIGITAL</span>
          <span className="hero__title-line hero__title-line--accent">
            LIBRARY
          </span>
        </h1>

        {/* Cycling Subtitle */}
        <motion.p
          key={currentTagline}
          className="hero__subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          {currentTagline}
        </motion.p>

        {/* Scroll Indicator */}
        <div className="hero__scroll-indicator" onClick={handleScrollDown}>
          <div className="hero__scroll-loop">
            <span className="hero__scroll-text">
              {SCROLL_LOOP_TEXT.repeat(3)}
            </span>
          </div>
          <div className="hero__scroll-arrow">↓</div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="hero__decoration">
        <span className="hero__decoration-text hero__decoration-text--1">
          FICTION
        </span>
        <span className="hero__decoration-text hero__decoration-text--2">
          BIOGRAPHY
        </span>
        <span className="hero__decoration-text hero__decoration-text--3">
          MYSTERY
        </span>
        <span className="hero__decoration-text hero__decoration-text--4">
          ROMANCE
        </span>
        <span className="hero__decoration-text hero__decoration-text--5">
          SCIENCE
        </span>
      </div>
    </motion.section>
  );
}

export default Hero;
