// ============================================
// FOOTER COMPONENT
// ============================================

import { useFontCycle } from '../../hooks/useFontCycle'
import './Footer.scss'

export const Footer = () => {
  const cyclingFont = useFontCycle()

  return (
    <footer className="footer" id="about">
      <div className="footer__container">
        <div className="footer__content">
          <p className="footer__project" style={{ fontFamily: cyclingFont }}>
            This website is made as a project for school purposes.
          </p>
          <p className="footer__author" style={{ fontFamily: cyclingFont }}>
            Made by <strong>Ricky SDE</strong>
          </p>
        </div>

        {/* Floating decimal patterns */}
        <div className="footer__decimals" aria-hidden="true">
          <span className="decimal">001.432</span>
          <span className="decimal">823.914</span>
          <span className="decimal">741.600</span>
          <span className="decimal">100.500</span>
          <span className="decimal">512.378</span>
        </div>
      </div>
    </footer>
  )
}
