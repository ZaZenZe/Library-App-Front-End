// ============================================
// NAVIGATION COMPONENT
// Fixed navigation bar with scroll trigger
// ============================================

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Navigation.scss';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface NavigationProps {
  onNavigate?: (section: 'hero' | 'books' | 'authors' | 'about') => void;
  isHidden?: boolean; // Hide navigation when modals are open
}

function Navigation({ onNavigate, isHidden = false }: NavigationProps) {
  const navRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // ScrollTrigger for navigation appearance
  useEffect(() => {
    if (!navRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: '100vh top',
      end: 'bottom bottom',
      onEnter: () => {
        setIsVisible(true);
        gsap.to(navRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
        });
      },
      onLeaveBack: () => {
        setIsVisible(false);
        gsap.to(navRef.current, {
          y: -100,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // Track active section based on scroll position
  useEffect(() => {
    const sections = [
      { id: 'hero', element: document.querySelector('.hero') },
      { id: 'books', element: document.querySelector('.books-section') },
      { id: 'authors', element: document.querySelector('.authors-section') },
    ];

    const triggers = sections
      .filter((section) => section.element)
      .map((section) =>
        ScrollTrigger.create({
          trigger: section.element as Element,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveSection(section.id),
          onEnterBack: () => setActiveSection(section.id),
        })
      );

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleNavClick = (
    section: 'hero' | 'books' | 'authors' | 'about',
    sectionClass: string
  ) => {
    const element = document.querySelector(sectionClass);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    onNavigate?.(section);
  };

  return (
    <nav
      ref={navRef}
      className={`navigation ${isVisible ? 'navigation--visible' : ''} ${isHidden ? 'navigation--hidden' : ''}`}
      role="navigation"
      aria-label="Main navigation"
      style={{ pointerEvents: isHidden ? 'none' : 'auto' }}
    >
      <div className="navigation__container">
        {/* Logo */}
        <button
          className="navigation__logo"
          onClick={() => handleNavClick('hero', '.hero')}
          aria-label="Go to home"
        >
          <span className="navigation__logo-icon">📚</span>
          <span className="navigation__logo-text">DIGITAL LIBRARY</span>
        </button>

        {/* Navigation Links */}
        <ul className="navigation__links">
          <li>
            <button
              className={`navigation__link ${
                activeSection === 'books' ? 'navigation__link--active' : ''
              }`}
              onClick={() => handleNavClick('books', '.books-section')}
            >
              Books
            </button>
          </li>
          <li>
            <button
              className={`navigation__link ${
                activeSection === 'authors' ? 'navigation__link--active' : ''
              }`}
              onClick={() => handleNavClick('authors', '.authors-section')}
            >
              Authors
            </button>
          </li>
          <li>
            <button
              className="navigation__link"
              onClick={() => handleNavClick('about', '#about')}
            >
              About
            </button>
          </li>
        </ul>

        {/* Mobile Menu Toggle */}
        <button
          className="navigation__mobile-toggle"
          aria-label="Toggle mobile menu"
          onClick={() => {
            const links = document.querySelector('.navigation__links');
            links?.classList.toggle('navigation__links--open');
          }}
        >
          <span className="navigation__hamburger"></span>
          <span className="navigation__hamburger"></span>
          <span className="navigation__hamburger"></span>
        </button>
      </div>
    </nav>
  );
}

export default Navigation;
