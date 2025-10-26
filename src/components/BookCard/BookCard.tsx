// ============================================
// BOOK CARD COMPONENT
// Individual book display card
// ============================================

import { motion } from 'framer-motion';
import type { Book } from '../../types/api';
import './BookCard.scss';

interface BookCardProps {
  book: Book;
  onCardClick?: (book: Book) => void;
  index?: number;
}

function BookCard({ book, onCardClick, index = 0 }: BookCardProps) {
  // Generate a color based on the book title for the "cover"
  const generateCoverColor = (title: string) => {
    const colors = [
      'linear-gradient(135deg, #2effd3, #00d4d4)',
      'linear-gradient(135deg, #23c6ff, #c656ff)',
      'linear-gradient(135deg, #c656ff, #ff69b4)',
      'linear-gradient(135deg, #00d4d4, #23c6ff)',
      'linear-gradient(135deg, #2effd3, #c656ff)',
    ];
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleClick = () => {
    onCardClick?.(book);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.article
      className="book-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${book.title}`}
    >
      {/* Book Cover (Generated) */}
      <div
        className="book-card__cover"
        style={{ background: generateCoverColor(book.title) }}
      >
        <span className="book-card__cover-title">
          {book.title.substring(0, 1)}
        </span>
      </div>

      {/* Book Info */}
      <div className="book-card__content">
        <h3 className="book-card__title">{book.title}</h3>

        {book.author && (
          <p className="book-card__authors">
            {book.author.name}
          </p>
        )}

        {book.isbn && (
          <div className="book-card__isbn">
            <span className="book-card__isbn-label">ISBN:</span>
            <span className="book-card__isbn-value">{book.isbn}</span>
          </div>
        )}

        <div className="book-card__meta">
          <span className="book-card__year">
            {book.year}
          </span>
          {book.publisher && (
            <span className="book-card__publisher">
              {book.publisher.name}
            </span>
          )}
        </div>
      </div>

      {/* Hover Indicator */}
      <div className="book-card__hover-icon">→</div>
    </motion.article>
  );
}

export default BookCard;
