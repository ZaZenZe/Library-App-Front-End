import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookCard } from '../BookCard';
import { useDebounce } from '../../hooks/useDebounce';
import type { Book, APIError } from '../../types/api';
import './BooksSection.scss';

interface BooksSectionProps {
  onBookClick?: (book: Book) => void;
  onAddBookClick?: () => void;
  books?: Book[];
  loading?: boolean;
  error?: APIError | null;
}

type BookSort = 'title' | 'year' | 'added';

function BooksSection({ onBookClick, onAddBookClick, books = [], loading = false, error = null }: BooksSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<BookSort>('title');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter and sort books with debounced search
  const sortedBooks = useMemo(() => {
    // Filter books by debounced search term
    const filtered = books.filter((book) => {
      if (!debouncedSearchTerm) return true;
      const term = debouncedSearchTerm.toLowerCase();
      return (
        book.title.toLowerCase().includes(term) ||
        book.isbn?.toLowerCase().includes(term) ||
        book.author?.name.toLowerCase().includes(term)
      );
    });

    // Sort books
    return [...filtered].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'year') {
        return (b.year || 0) - (a.year || 0);
      } else {
        // sort by added (book id)
        return (b.id || 0) - (a.id || 0);
      }
    });
  }, [books, debouncedSearchTerm, sortBy]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="books-section__loading">
          <div className="books-section__spinner" />
          <p>Loading books...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="books-section__error">
          <div className="books-section__error-icon">⚠️</div>
          <h3>Failed to Load Books</h3>
          <p>{error.message || 'An error occurred while fetching books.'}</p>
        </div>
      );
    }

    if (books.length === 0) {
      return (
        <div className="books-section__empty">
          <div className="books-section__empty-icon">📚</div>
          <h3>No Books Yet</h3>
          <p>Be the first to add a book to the library!</p>
          {onAddBookClick && (
            <button className="books-section__add-btn" onClick={onAddBookClick}>
              <span className="books-section__add-icon">+</span>
              Add First Book
            </button>
          )}
        </div>
      );
    }

    if (sortedBooks.length === 0) {
      return (
        <div className="books-section__empty">
          <div className="books-section__empty-icon">🔍</div>
          <h3>No Books Found</h3>
          <p>Try a different search term.</p>
        </div>
      );
    }

    return (
      <motion.div
        className="books-section__grid"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        {sortedBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onCardClick={onBookClick}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <section className="books-section" id="books">
      <div className="books-section__container">
        {/* Section Header */}
        <motion.div
          className="books-section__header"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="books-section__eyebrow">Book Collection</span>
          <h2 className="books-section__title">Browse Books</h2>
          <p className="books-section__subtitle">
            Search, sort, and curate your personal reading catalogue.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="books-section__controls"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search Bar */}
          <div className="books-section__search">
            <span className="books-section__search-icon">🔍</span>
            <input
              id="search-books"
              name="search-books"
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="books-section__search-input"
            />
            {searchTerm && (
              <button
                className="books-section__search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="books-section__sort">
            <label htmlFor="sort-books">Sort by:</label>
            <select
              id="sort-books"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as BookSort)}
              className="books-section__sort-select"
            >
              <option value="title">Title (A-Z)</option>
              <option value="year">Publication Year</option>
              <option value="added">Recently Added</option>
            </select>
          </div>

          {/* Add Book Button */}
          {onAddBookClick && (
            <button className="books-section__add-btn" onClick={onAddBookClick}>
              <span className="books-section__add-icon">+</span>
              Add Book
            </button>
          )}
        </motion.div>

        {/* Results Count */}
        {!loading && !error && books.length > 0 && (
          <motion.div
            className="books-section__results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Showing {sortedBooks.length} of {books.length} book
            {books.length !== 1 ? 's' : ''}
          </motion.div>
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </section>
  );
}

export default BooksSection;
