import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book } from '../../types/api';
import { useBook, useDeleteBook } from '../../hooks/useAPI';
import './BookDetailModal.scss';

interface BookDetailModalProps {
  bookId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (book: Book) => void;
  onDeleted?: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  bookId,
  isOpen,
  onClose,
  onEdit,
  onDeleted,
}) => {
  const { data: book, loading: isLoading, error, execute: refetch } = useBook(bookId || 0, !!bookId);
  const { deleteBook, loading: isDeleting } = useDeleteBook();

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDelete = async () => {
    if (!book) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`
    );

    if (confirmDelete) {
      const success = await deleteBook(book.id);
      
      if (success) {
        onDeleted?.();
        onClose();
      } else {
        alert('Failed to delete book. Please try again.');
      }
    }
  };

  const handleEdit = () => {
    if (book && onEdit) {
      onEdit(book);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Generate cover color (same logic as BookCard)
  const generateCoverColor = (title: string): string => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];

    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="book-detail-modal__loading">
          <div className="book-detail-modal__spinner" />
          <p>Loading book details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="book-detail-modal__error">
          <div className="book-detail-modal__error-icon">⚠️</div>
          <h3>Failed to Load Book</h3>
          <p>{error.message || 'An error occurred while fetching the book details.'}</p>
          <button className="book-detail-modal__retry-btn" onClick={() => refetch()}>
            Try Again
          </button>
        </div>
      );
    }

    if (!book) {
      return (
        <div className="book-detail-modal__error">
          <div className="book-detail-modal__error-icon">📚</div>
          <h3>Book Not Found</h3>
          <p>The requested book could not be found.</p>
        </div>
      );
    }

    return (
      <>
        <button
          className="book-detail-modal__close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="book-detail-modal__content">
          {/* Book Cover */}
          <div className="book-detail-modal__cover-section">
            <motion.div
              className="book-detail-modal__cover"
              style={{ background: generateCoverColor(book.title) }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="book-detail-modal__cover-overlay">
                <span className="book-detail-modal__cover-letter">
                  {book.title.charAt(0).toUpperCase()}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Book Details */}
          <div className="book-detail-modal__details">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h2 className="book-detail-modal__title">{book.title}</h2>
              <p className="book-detail-modal__author">
                by <span>{book.author?.name || 'Unknown Author'}</span>
              </p>
            </motion.div>

            <motion.div
              className="book-detail-modal__meta"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="book-detail-modal__meta-item">
                <span className="book-detail-modal__meta-label">ISBN</span>
                <span className="book-detail-modal__meta-value">{book.isbn}</span>
              </div>

              <div className="book-detail-modal__meta-item">
                <span className="book-detail-modal__meta-label">Publication Year</span>
                <span className="book-detail-modal__meta-value">{book.year}</span>
              </div>

              {book.publisher && (
                <div className="book-detail-modal__meta-item">
                  <span className="book-detail-modal__meta-label">Publisher</span>
                  <span className="book-detail-modal__meta-value">{book.publisher.name}</span>
                </div>
              )}

              <div className="book-detail-modal__meta-item">
                <span className="book-detail-modal__meta-label">Book ID</span>
                <span className="book-detail-modal__meta-value">#{book.id}</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="book-detail-modal__actions"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {onEdit && (
                <button
                  className="book-detail-modal__action-btn book-detail-modal__action-btn--edit"
                  onClick={handleEdit}
                  disabled={isDeleting}
                >
                  <span className="book-detail-modal__action-icon">✏️</span>
                  Edit Book
                </button>
              )}

              <button
                className="book-detail-modal__action-btn book-detail-modal__action-btn--delete"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <span className="book-detail-modal__action-icon">
                  {isDeleting ? '⏳' : '🗑️'}
                </span>
                {isDeleting ? 'Deleting...' : 'Delete Book'}
              </button>
            </motion.div>
          </div>
        </div>
      </>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="book-detail-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="book-detail-modal__backdrop"
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(20px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            className="book-detail-modal__container"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-detail-title"
          >
            {renderContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
