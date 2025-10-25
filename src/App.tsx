import { useState } from 'react'
import { ParallaxBackground } from './components/ParallaxBackground'
import './App.css'

function App() {
  const [activeLayer, setActiveLayer] = useState<1 | 2 | 3>(1)

  return (
    <>
      <ParallaxBackground activeLayer={activeLayer} />
      
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', padding: '2rem' }}>
        <h1 style={{ color: 'var(--accent-teal)', fontFamily: 'var(--font-heading)' }}>
          Digital Library
        </h1>
        
        <p style={{ color: 'var(--foreground)', marginTop: '2rem' }}>
          Parallax Background System Active! Move your mouse to see the effect.
        </p>
        
        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setActiveLayer(1)}
            style={{ 
              padding: '1rem 2rem', 
              background: activeLayer === 1 ? 'var(--accent-teal)' : 'transparent',
              border: '2px solid var(--accent-teal)',
              color: activeLayer === 1 ? 'var(--primary-dark)' : 'var(--accent-teal)',
              cursor: 'pointer',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Layer 1 (Hero)
          </button>
          <button 
            onClick={() => setActiveLayer(2)}
            style={{ 
              padding: '1rem 2rem', 
              background: activeLayer === 2 ? 'var(--accent-cyan)' : 'transparent',
              border: '2px solid var(--accent-cyan)',
              color: activeLayer === 2 ? 'var(--primary-dark)' : 'var(--accent-cyan)',
              cursor: 'pointer',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Layer 2 (Books)
          </button>
          <button 
            onClick={() => setActiveLayer(3)}
            style={{ 
              padding: '1rem 2rem', 
              background: activeLayer === 3 ? 'var(--accent-purple)' : 'transparent',
              border: '2px solid var(--accent-purple)',
              color: activeLayer === 3 ? 'var(--primary-dark)' : 'var(--accent-purple)',
              cursor: 'pointer',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Layer 3 (Authors)
          </button>
        </div>
        
        <div style={{ marginTop: '100vh', padding: '2rem', background: 'rgba(6, 20, 44, 0.8)', borderRadius: '1rem' }}>
          <h2 style={{ color: 'var(--accent-cyan)' }}>Scroll Down</h2>
          <p style={{ color: 'var(--foreground)' }}>
            The parallax background responds to your mouse movement and creates depth.
            Try switching between different layers to see the various text-based patterns!
          </p>
        </div>
      </div>
    </>
  )
}

export default App
