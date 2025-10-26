import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Author } from '../../types/api';
import { authorsAPI } from '../../services/api';
import './AuthorDetailModal.scss';

interface AuthorDetailModalProps {
  authorId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (author: Author) => void;
  onDeleted: () => void;
  onError?: (message: string) => void;
}

export const AuthorDetailModal = ({ authorId, isOpen, onClose, onEdit, onDeleted, onError }: AuthorDetailModalProps) => {
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchAuthor = useCallback(async () => {
    if (!authorId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await authorsAPI.getById(authorId);
      setAuthor(data);
    } catch (err) {
      console.error('Error fetching author:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load author details');
    } finally {
      setLoading(false);
    }
  }, [authorId]);

  useEffect(() => {
    if (isOpen && authorId) {
      fetchAuthor();
    }
  }, [isOpen, authorId, fetchAuthor]);

  const handleDelete = async () => {
    if (!authorId) return;

    setIsDeleting(true);
    try {
      await authorsAPI.delete(authorId);
      onDeleted();
      onClose();
    } catch (err) {
      console.error('Error deleting author:', err);
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage = error.response?.data?.error || 'Failed to delete author';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditClick = () => {
    if (author) {
      onEdit(author);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="author-detail-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="author-detail-modal__content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {loading && (
              <div className="author-detail-modal__loading">
                <div className="spinner"></div>
                <p>Loading author details...</p>
              </div>
            )}

            {error && (
              <div className="author-detail-modal__error">
                <p>{error}</p>
                <button onClick={onClose} className="btn btn--secondary">
                  Close
                </button>
              </div>
            )}

            {!loading && !error && author && (
              <>
                <button
                  className="author-detail-modal__close"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  ✕
                </button>

                <div className="author-detail-modal__header">
                  <h1 className="author-detail-modal__name">{author.name}</h1>
                  <div className="author-detail-modal__stats">
                    <span className="stat">
                      <strong>{author.books?.length || 0}</strong> {(author.books?.length || 0) === 1 ? 'book' : 'books'}
                    </span>
                  </div>
                </div>

                <div className="author-detail-modal__body">
                  {author.books && author.books.length > 0 ? (
                    <div className="author-detail-modal__books">
                      <h2>Books by {author.name}</h2>
                      <div className="books-grid">
                        {author.books.map((book) => (
                          <div key={book.id} className="book-item">
                            <h3 className="book-item__title">{book.title}</h3>
                            <span className="book-item__year">{book.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="author-detail-modal__empty">
                      <p>No books by this author yet.</p>
                    </div>
                  )}
                </div>

                <div className="author-detail-modal__actions">
                  <button
                    onClick={handleEditClick}
                    className="btn btn--primary"
                  >
                    Edit Author
                  </button>
                  
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn btn--danger"
                    >
                      Delete Author
                    </button>
                  ) : (
                    <div className="delete-confirm">
                      <p>Are you sure? This cannot be undone.</p>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="btn btn--danger"
                      >
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="btn btn--secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
