import { useState } from 'react'
import type { Book } from './types/api'
import { useBooks, useAuthors } from './hooks/useAPI'
import { ParallaxBackground } from './components/ParallaxBackground'
import { LoadingScreen } from './components/LoadingScreen'
import { Hero } from './components/Hero'
import { Navigation } from './components/Navigation'
import { BooksSection } from './components/BooksSection'
import { BookDetailModal } from './components/BookDetailModal'
import { BookFormModal } from './components/BookFormModal'
import './App.css'

function App() {
  const [activeLayer, setActiveLayer] = useState<1 | 2 | 3>(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  // Fetch books and authors ONCE at app level - prevent duplicate API calls
  const { data: books, loading: booksLoading, error: booksError } = useBooks()
  const { data: authors } = useAuthors() // Authors will be used later in Step 11

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
    // Open edit form with book data
    setEditingBook(book);
    setIsFormModalOpen(true);
    setIsModalOpen(false);
  }

  const handleAddBook = () => {
    setEditingBook(null);
    setIsFormModalOpen(true);
  }

  const handleFormSuccess = () => {
    // Refresh books list - BooksSection will refetch automatically
    setIsFormModalOpen(false);
    setEditingBook(null);
  }

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingBook(null);
  }

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
      
      <Navigation onNavigate={handleNavigate} />
      
      {/* Pass books and authors data to ParallaxBackground to prevent duplicate API calls */}
      <ParallaxBackground 
        activeLayer={activeLayer} 
        books={books || undefined}
        authors={authors || undefined}
      />
      
      <main style={{ position: 'relative', zIndex: 10 }}>
        <Hero 
          onBrowseBooksClick={handleBrowseBooks}
          onExploreAuthorsClick={handleExploreAuthors}
        />
        
        {/* Books Section - Pass data from parent to avoid duplicate API calls */}
        <BooksSection 
          onBookClick={handleBookClick}
          onAddBookClick={handleAddBook}
          books={books || undefined}
          loading={booksLoading}
          error={booksError}
        />
        
        {/* Book Detail Modal */}
        <BookDetailModal
          bookId={selectedBookId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onEdit={handleEditBook}
          onDeleted={handleBookDeleted}
        />

        {/* Book Form Modal (Add/Edit) */}
        <BookFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          editBook={editingBook}
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
