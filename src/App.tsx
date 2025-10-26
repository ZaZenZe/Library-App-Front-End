import { useState, useEffect } from 'react'
import type { Book, Author } from './types/api'
import { useBooks, useAuthors } from './hooks/useAPI'
import { useToast } from './hooks/useToast'
import { ParallaxBackground } from './components/ParallaxBackground'
import { LoadingScreen } from './components/LoadingScreen'
import { Hero } from './components/Hero'
import { Navigation } from './components/Navigation'
import { BooksSection } from './components/BooksSection'
import { AuthorsSection } from './components/AuthorsSection'
import { Footer } from './components/Footer'
import { BookDetailModal } from './components/BookDetailModal'
import { BookFormModal } from './components/BookFormModal'
import { AuthorDetailModal } from './components/AuthorDetailModal'
import { AuthorFormModal } from './components/AuthorFormModal'
import { ToastContainer } from './components/Toast'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null)
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [isAuthorFormModalOpen, setIsAuthorFormModalOpen] = useState(false)

  // Toast notifications
  const { toasts, removeToast, success, error } = useToast()

  // Hide scrollbar during loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isLoading]);

  // Fetch books and authors ONCE at app level - prevent duplicate API calls
  const { data: books, loading: booksLoading, error: booksError, refetch: refetchBooks } = useBooks()
  const { data: authors, loading: authorsLoading, error: authorsError, refetch: refetchAuthors } = useAuthors()

  const handleNavigate = (section: 'hero' | 'books' | 'authors' | 'about') => {
    // Scroll to appropriate section (no need to manage activeLayer - ParallaxBackground handles it automatically)
    const targetSection = document.querySelector(`.${section === 'hero' ? 'hero' : section === 'books' ? 'books-section' : 'authors-section'}`)
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' })
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
    // Refresh books list
    refetchBooks();
    setIsModalOpen(false)
    setSelectedBookId(null)
    success('Book deleted successfully! 🗑️')
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
    // Refresh books list
    refetchBooks();
    setIsFormModalOpen(false);
    setEditingBook(null);
    success(editingBook ? 'Book updated successfully! ✨' : 'Book added to your library! 📚')
  }

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingBook(null);
  }

  const handleAuthorClick = (author: Author) => {
    setSelectedAuthorId(author.id);
    setIsAuthorModalOpen(true);
  }

  const handleAddAuthor = () => {
    setEditingAuthor(null);
    setIsAuthorFormModalOpen(true);
  }

  const handleEditAuthor = (author: Author) => {
    setEditingAuthor(author);
    setIsAuthorModalOpen(false);
    setIsAuthorFormModalOpen(true);
  }

  const handleAuthorFormSuccess = () => {
    // Refresh authors list
    refetchAuthors();
    setIsAuthorFormModalOpen(false);
    setEditingAuthor(null);
    success(editingAuthor ? 'Author profile updated successfully! ✨' : 'Author profile created successfully! 👤')
  }

  const handleCloseAuthorForm = () => {
    setIsAuthorFormModalOpen(false);
    setEditingAuthor(null);
  }

  const handleAuthorDeleted = () => {
    // Refresh authors list
    refetchAuthors();
    setIsAuthorModalOpen(false);
    setSelectedAuthorId(null);
    success('Author deleted successfully! 🗑️')
  }

  const handleCloseAuthorModal = () => {
    setIsAuthorModalOpen(false);
    setSelectedAuthorId(null);
  }

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
      
      <Navigation 
        onNavigate={handleNavigate} 
        isHidden={isModalOpen || isFormModalOpen || isAuthorModalOpen || isAuthorFormModalOpen}
      />
      
      {/* Pass books and authors data to ParallaxBackground to prevent duplicate API calls */}
      <ParallaxBackground 
        books={books || undefined}
        authors={authors || undefined}
      />
      
      <main style={{ position: 'relative', zIndex: 10 }}>
        <Hero />
        
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
          onError={error}
        />

        {/* Book Form Modal (Add/Edit) */}
        <BookFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          editBook={editingBook}
          onError={error}
          onAuthorsRefresh={refetchAuthors}
        />
        
        {/* Authors Section */}
        <AuthorsSection
          authors={authors || undefined}
          loading={authorsLoading}
          error={authorsError}
          onAuthorClick={handleAuthorClick}
          onAddAuthor={handleAddAuthor}
        />

        {/* Author Detail Modal */}
        <AuthorDetailModal
          authorId={selectedAuthorId}
          isOpen={isAuthorModalOpen}
          onClose={handleCloseAuthorModal}
          onEdit={handleEditAuthor}
          onDeleted={handleAuthorDeleted}
          onError={error}
        />

        {/* Author Form Modal (Add/Edit) */}
        <AuthorFormModal
          isOpen={isAuthorFormModalOpen}
          onClose={handleCloseAuthorForm}
          onSuccess={handleAuthorFormSuccess}
          editAuthor={editingAuthor}
          onError={error}
        />

        {/* Footer */}
        <Footer />
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  )
}

export default App
