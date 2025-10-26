import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Author, APIError } from '../../types/api';
import { AuthorCard } from './AuthorCard';
import { useDebounce } from '../../hooks/useDebounce';
import './AuthorsSection.scss';

interface AuthorsSectionProps {
  authors?: Author[];
  loading?: boolean;
  error?: APIError | null;
  onAuthorClick?: (author: Author) => void;
  onAddAuthor?: () => void;
}

export const AuthorsSection: React.FC<AuthorsSectionProps> = ({
  authors = [],
  loading = false,
  error = null,
  onAuthorClick,
  onAddAuthor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'bookCount'>('name');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter and sort authors with debounced search
  const sortedAuthors = useMemo(() => {
    // Filter authors by debounced search term
    const filtered = authors.filter((author) =>
      author.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    // Sort authors
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return (b.books?.length || 0) - (a.books?.length || 0);
      }
    });
  }, [authors, debouncedSearchTerm, sortBy]);

  const renderContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className="authors-section__loading">
          <div className="authors-section__spinner" />
          <p>Loading authors...</p>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="authors-section__error">
          <div className="authors-section__error-icon">⚠️</div>
          <h3>Failed to Load Authors</h3>
          <p>{error.message || 'An error occurred while fetching authors.'}</p>
        </div>
      );
    }

    // Empty state
    if (authors.length === 0) {
      return (
        <div className="authors-section__empty">
          <div className="authors-section__empty-icon">✍️</div>
          <h3>No Authors Yet</h3>
          <p>Be the first to add an author to the library!</p>
          {onAddAuthor && (
            <button className="authors-section__add-btn" onClick={onAddAuthor}>
              <span className="authors-section__add-icon">+</span>
              Add First Author
            </button>
          )}
        </div>
      );
    }

    // No search results
    if (sortedAuthors.length === 0) {
      return (
        <div className="authors-section__empty">
          <div className="authors-section__empty-icon">🔍</div>
          <h3>No Authors Found</h3>
          <p>Try a different search term.</p>
        </div>
      );
    }

    // Authors grid
    return (
      <motion.div
        className="authors-section__grid"
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
        {sortedAuthors.map((author) => (
          <AuthorCard
            key={author.id}
            author={author}
            onClick={() => onAuthorClick?.(author)}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <section className="authors-section" id="authors">
      <div className="authors-section__container">
        {/* Section Header */}
        <motion.div
          className="authors-section__header"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="authors-section__eyebrow">Featured Authors</span>
          <h2 className="authors-section__title">Literary Voices</h2>
          <p className="authors-section__subtitle">
            Explore the brilliant minds behind your favorite stories
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="authors-section__controls"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search Bar */}
          <div className="authors-section__search">
            <span className="authors-section__search-icon">🔍</span>
            <input
              id="search-authors"
              name="search-authors"
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="authors-section__search-input"
            />
            {searchTerm && (
              <button
                className="authors-section__search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="authors-section__sort">
            <label htmlFor="sort-authors">Sort by:</label>
            <select
              id="sort-authors"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'bookCount')}
              className="authors-section__sort-select"
            >
              <option value="name">Name (A-Z)</option>
              <option value="bookCount">Book Count</option>
            </select>
          </div>

          {/* Add Author Button */}
          {onAddAuthor && (
            <button className="authors-section__add-btn" onClick={onAddAuthor}>
              <span className="authors-section__add-icon">+</span>
              Add Author
            </button>
          )}
        </motion.div>

        {/* Results Count */}
        {!loading && !error && authors.length > 0 && (
          <motion.div
            className="authors-section__results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Showing {sortedAuthors.length} of {authors.length} author
            {authors.length !== 1 ? 's' : ''}
          </motion.div>
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </section>
  );
};
