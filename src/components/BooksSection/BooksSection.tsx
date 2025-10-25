// ============================================
// BOOKS SECTION COMPONENT
// Grid display of all books with search/filter
// ============================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBooks } from '../../hooks/useAPI';
import { BookCard } from '../BookCard';
import type { Book } from '../../types/api';
import './BooksSection.scss';

interface BooksSectionProps {
  onBookClick?: (book: Book) => void;
  onAddBookClick?: () => void;
}

function BooksSection({ onBookClick, onAddBookClick }: BooksSectionProps) {
  const { data: books, loading, error } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter books based on search term
  const filteredBooks = useMemo(() => {
    if (!books) return [];
    if (!searchTerm) return books;

    const term = searchTerm.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.isbn?.toLowerCase().includes(term) ||
        book.author?.name.toLowerCase().includes(term)
    );
  }, [books, searchTerm]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="books-section__grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="skeleton-card" aria-hidden="true">
              <div className="skeleton-card__cover" />
              <div className="skeleton-card__content">
                <div className="skeleton-card__title" />
                <div className="skeleton-card__author" />
                <div className="skeleton-card__isbn" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="books-section__error">
          <span className="books-section__error-icon">⚠️</span>
          <h3 className="books-section__error-title">
            Oops! Couldn't connect to the library
          </h3>
          <p className="books-section__error-message">
            {error.message || 'Please try again later.'}
          </p>
          <button 
            className="books-section__retry-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (filteredBooks.length === 0 && searchTerm) {
      return (
        <div className="books-section__empty">
          <span className="books-section__empty-icon">🔍</span>
          <h3 className="books-section__empty-title">
            No matches found
          </h3>
          <p className="books-section__empty-message">
            Try a different search term or clear the filter
          </p>
          <button
            className="books-section__clear-btn"
            onClick={() => setSearchTerm('')}
          >
            Clear Search
          </button>
        </div>
      );
    }

    if (filteredBooks.length === 0) {
      return (
        <div className="books-section__empty">
          <span className="books-section__empty-icon">📚</span>
          <h3 className="books-section__empty-title">
            Your library is waiting to be filled
          </h3>
          <p className="books-section__empty-message">
            Add your first book to get started!
          </p>
        </div>
      );
    }

    return (
      <div className="books-section__grid">
        {filteredBooks.map((book, index) => (
          <BookCard
            key={book.id}
            book={book}
            onCardClick={onBookClick}
            index={index}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="books-section" id="books">
      <div className="books-section__container">
        {/* Section Header */}
        <motion.div
          className="books-section__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="books-section__title-wrapper">
            <span className="books-section__eyebrow">Book Collection</span>
            <h2 className="books-section__title">Browse Books</h2>
          </div>

          <button
            className="books-section__add-btn"
            onClick={onAddBookClick}
            aria-label="Add new book"
          >
            <span className="books-section__add-icon">+</span>
            <span className="books-section__add-text">Add Book</span>
          </button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="books-section__search"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="books-section__search-wrapper">
            <span className="books-section__search-icon">🔍</span>
            <input
              type="text"
              className="books-section__search-input"
              placeholder="Search by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search books"
            />
            {searchTerm && (
              <button
                className="books-section__search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {books && books.length > 0 && (
            <p className="books-section__results-count">
              Showing {filteredBooks.length} of {books.length} books
            </p>
          )}
        </motion.div>

        {/* Books Grid / Loading / Error / Empty States */}
        {renderContent()}
      </div>
    </section>
  );
}

export default BooksSection;
