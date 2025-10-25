import { useState } from 'react'
import type { Book } from './types/api'
import { ParallaxBackground } from './components/ParallaxBackground'
import { LoadingScreen } from './components/LoadingScreen'
import { Hero } from './components/Hero'
import { Navigation } from './components/Navigation'
import { BooksSection } from './components/BooksSection'
import { BookDetailModal } from './components/BookDetailModal'
import './App.css'

function App() {
  const [activeLayer, setActiveLayer] = useState<1 | 2 | 3>(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handleNavigate = (section: 'hero' | 'books' | 'authors' | 'about') => {
    if (section === 'books') {
      setActiveLayer(2)
    } else if (section === 'authors') {
      setActiveLayer(3)
    } else if (section === 'hero') {
      setActiveLayer(1)
    }
  }

  const handleBookClick = (book: Book) => {
    setSelectedBookId(book.id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBookId(null)
  }

  const handleBookDeleted = () => {
    // Refresh books list - BooksSection will refetch automatically
    setIsModalOpen(false)
    setSelectedBookId(null)
  }

  const handleEditBook = (book: Book) => {
    // TODO: Open edit form modal (Step 10)
    console.log('Edit book:', book)
    setIsModalOpen(false)
  }

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
      
      <Navigation onNavigate={handleNavigate} />
      
      <ParallaxBackground activeLayer={activeLayer} />
      
      <main style={{ position: 'relative', zIndex: 10 }}>
        <Hero 
          onBrowseBooksClick={handleBrowseBooks}
          onExploreAuthorsClick={handleExploreAuthors}
        />
        
        {/* Books Section */}
        <BooksSection 
          onBookClick={handleBookClick}
          onAddBookClick={() => console.log('Add book clicked')}
        />
        
        {/* Book Detail Modal */}
        <BookDetailModal
          bookId={selectedBookId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onEdit={handleEditBook}
          onDeleted={handleBookDeleted}
        />
        
        {/* Placeholder Authors section */}
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
