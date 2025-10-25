import { useState } from 'react'
import { ParallaxBackground } from './components/ParallaxBackground'
import { LoadingScreen } from './components/LoadingScreen'
import { Hero } from './components/Hero'
import './App.css'

function App() {
  const [activeLayer, setActiveLayer] = useState<1 | 2 | 3>(1)
  const [isLoading, setIsLoading] = useState(true)

  const handleBrowseBooks = () => {
    setActiveLayer(2)
    const booksSection = document.querySelector('.books-section')
    if (booksSection) {
      booksSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleExploreAuthors = () => {
    setActiveLayer(3)
    const authorsSection = document.querySelector('.authors-section')
    if (authorsSection) {
      authorsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
      
      <ParallaxBackground activeLayer={activeLayer} />
      
      <main style={{ position: 'relative', zIndex: 10 }}>
        <Hero 
          onBrowseBooksClick={handleBrowseBooks}
          onExploreAuthorsClick={handleExploreAuthors}
        />
        
        {/* Placeholder sections for navigation */}
        <section 
          className="books-section" 
          style={{ 
            minHeight: '100vh', 
            padding: '4rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ 
            maxWidth: '800px', 
            textAlign: 'center',
            background: 'rgba(6, 20, 44, 0.8)',
            padding: '3rem',
            borderRadius: '1.6rem',
            border: '1px solid var(--border-glow)'
          }}>
            <h2 style={{ 
              color: 'var(--accent-cyan)', 
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(3.2rem, 5vw, 4.8rem)',
              marginBottom: '2rem'
            }}>
              Books Section
            </h2>
            <p style={{ 
              color: 'var(--foreground)', 
              fontSize: '1.8rem',
              lineHeight: '1.6'
            }}>
              📚 Coming Soon: Browse our complete book collection with advanced search and filters.
              This section will be implemented in Step 8.
            </p>
          </div>
        </section>
        
        <section 
          className="authors-section"
          style={{ 
            minHeight: '100vh', 
            padding: '4rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ 
            maxWidth: '800px', 
            textAlign: 'center',
            background: 'rgba(6, 20, 44, 0.8)',
            padding: '3rem',
            borderRadius: '1.6rem',
            border: '1px solid var(--border-glow)'
          }}>
            <h2 style={{ 
              color: 'var(--accent-purple)', 
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(3.2rem, 5vw, 4.8rem)',
              marginBottom: '2rem'
            }}>
              Authors Section
            </h2>
            <p style={{ 
              color: 'var(--foreground)', 
              fontSize: '1.8rem',
              lineHeight: '1.6'
            }}>
              ✍️ Coming Soon: Discover our featured authors and their works.
              This section will be implemented in Step 11.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}

export default App
