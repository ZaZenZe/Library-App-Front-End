import { motion } from 'framer-motion';
import type { Author } from '../../types/api';
import './AuthorCard.scss';

interface AuthorCardProps {
  author: Author;
  onClick?: () => void;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author, onClick }) => {
  const bookCount = author.books?.length || 0;
  const recentBooks = author.books?.slice(0, 3) || [];

  // Generate gradient background based on author name
  const generateGradient = (name: string): string => {
    const gradients = [
      'linear-gradient(135deg, #EA7ACF 0%, #C89AD9 100%)', // Sakura → Lavender
      'linear-gradient(135deg, #6EC7D7 0%, #EA7ACF 100%)', // Cyan → Sakura
      'linear-gradient(135deg, #C89AD9 0%, #6EC7D7 100%)', // Lavender → Cyan
      'linear-gradient(135deg, #EA7ACF 10%, #6EC7D7 50%, #C89AD9 90%)', // Triple gradient
      'linear-gradient(135deg, #6EC7D7 0%, #C89AD9 100%)', // Cyan → Lavender
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return gradients[Math.abs(hash) % gradients.length];
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <motion.div
      className="author-card"
      variants={cardVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
    >
      {/* Avatar */}
      <div
        className="author-card__avatar"
        style={{ background: generateGradient(author.name) }}
      >
        <span className="author-card__initials">{getInitials(author.name)}</span>
      </div>

      {/* Content */}
      <div className="author-card__content">
        <h3 className="author-card__name">{author.name}</h3>

        <div className="author-card__stats">
          <span className="author-card__stat">
            <span className="author-card__stat-icon">📚</span>
            <span className="author-card__stat-value">{bookCount}</span>
            <span className="author-card__stat-label">
              {bookCount === 1 ? 'book' : 'books'}
            </span>
          </span>
        </div>

        {/* Recent Books */}
        {recentBooks.length > 0 && (
          <div className="author-card__books">
            <h4 className="author-card__books-title">Recent Works:</h4>
            <ul className="author-card__books-list">
              {recentBooks.map((book) => (
                <li key={book.id} className="author-card__book-item">
                  <span className="author-card__book-title">{book.title}</span>
                  <span className="author-card__book-year">({book.year})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Hover Indicator */}
      <div className="author-card__hover-indicator">
        <span>View Details</span>
        <span className="author-card__arrow">→</span>
      </div>
    </motion.div>
  );
};
