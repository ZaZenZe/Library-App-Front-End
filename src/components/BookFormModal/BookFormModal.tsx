import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book, CreateBookDTO, UpdateBookDTO } from '../../types/api';
import { useAuthors, useCreateBook, useUpdateBook, useImportBook } from '../../hooks/useAPI';
import './BookFormModal.scss';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (book: Book) => void;
  onError?: (message: string) => void;
  editBook?: Book | null; // If provided, we're editing; otherwise, creating
}

interface FormData {
  title: string;
  authorId: string;
  isbn: string;
  year: string; // Match API field name
  genre: string;
}

interface FormErrors {
  title?: string;
  authorId?: string;
  isbn?: string;
  year?: string; // Match API field name
  genre?: string;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  editBook,
}) => {
  const { data: authors, loading: authorsLoading } = useAuthors();
  const { createBook, loading: creating } = useCreateBook();
  const { updateBook, loading: updating } = useUpdateBook();
  const { importBook, loading: importing } = useImportBook();

  const isEditMode = !!editBook;
  const [formData, setFormData] = useState<FormData>({
    title: '',
    authorId: '',
    isbn: '',
    year: '',
    genre: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isbnImportValue, setIsbnImportValue] = useState('');
  const [showIsbnImport, setShowIsbnImport] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editBook) {
      setFormData({
        title: editBook.title,
        authorId: editBook.authorId.toString(),
        isbn: editBook.isbn,
        year: editBook.year.toString(),
        genre: '', // Genre not stored in Book model
      });
    } else {
      // Reset form when not editing
      setFormData({
        title: '',
        authorId: '',
        isbn: '',
        year: '',
        genre: '',
      });
    }
    setErrors({});
  }, [editBook, isOpen]);

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.authorId) {
      newErrors.authorId = 'Please select an author';
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required';
    } else if (!/^[0-9-]+$/.test(formData.isbn)) {
      newErrors.isbn = 'ISBN should contain only numbers and hyphens';
    }

    if (!formData.year.trim()) {
      newErrors.year = 'Publication year is required';
    } else {
      const year = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1000 || year > currentYear + 1) {
        newErrors.year = `Year must be between 1000 and ${currentYear + 1}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const bookData: CreateBookDTO = {
      title: formData.title.trim(),
      authorId: parseInt(formData.authorId),
      isbn: formData.isbn.trim(),
      year: parseInt(formData.year),
      genre: formData.genre.trim() || undefined, // Optional field
    };

    try {
      if (isEditMode && editBook) {
        // Update existing book
        const updateData: UpdateBookDTO = bookData;
        const result = await updateBook(editBook.id, updateData);

        if (result) {
          onSuccess?.(result);
          onClose();
        } else {
          onError?.('Failed to update book. Please try again.');
        }
      } else {
        // Create new book
        const result = await createBook(bookData);

        if (result) {
          onSuccess?.(result);
          onClose();
        } else {
          onError?.('Failed to add book. Please try again.');
        }
      }
    } catch {
      onError?.(isEditMode ? 'Failed to update book. Please try again.' : 'Failed to add book. Please try again.');
    }
  };

  const handleIsbnImport = async () => {
    if (!isbnImportValue.trim()) {
      onError?.('Please enter an ISBN to import');
      return;
    }

    const result = await importBook(isbnImportValue.trim());

    if (result) {
      // Populate form with imported data
      setFormData({
        title: result.title,
        authorId: result.authorId.toString(),
        isbn: result.isbn,
        year: result.year.toString(),
        genre: '', // Genre not returned by import
      });
      setShowIsbnImport(false);
      setIsbnImportValue('');
    } else {
      onError?.('Failed to import book. ISBN not found or already in library.');
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isSubmitting = creating || updating;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="book-form-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="book-form-modal__backdrop"
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(20px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            className="book-form-modal__container"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-form-title"
          >
            <button
              className="book-form-modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="book-form-modal__header">
              <h2 id="book-form-title" className="book-form-modal__title">
                {isEditMode ? 'Edit Book' : 'Add New Book'}
              </h2>
              <p className="book-form-modal__subtitle">
                {isEditMode ? 'Update book information' : 'Fill in the details to add a book to your library'}
              </p>
            </div>

            {!isEditMode && (
              <div className="book-form-modal__import-section">
                {!showIsbnImport ? (
                  <button
                    className="book-form-modal__import-btn"
                    onClick={() => setShowIsbnImport(true)}
                    type="button"
                  >
                    📚 Import by ISBN
                  </button>
                ) : (
                  <motion.div
                    className="book-form-modal__import-input-group"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <input
                      type="text"
                      className="book-form-modal__import-input"
                      placeholder="Enter ISBN (e.g., 978-3-16-148410-0)"
                      value={isbnImportValue}
                      onChange={(e) => setIsbnImportValue(e.target.value)}
                      disabled={importing}
                    />
                    <button
                      className="book-form-modal__import-submit"
                      onClick={handleIsbnImport}
                      disabled={importing}
                      type="button"
                    >
                      {importing ? 'Importing...' : 'Import'}
                    </button>
                    <button
                      className="book-form-modal__import-cancel"
                      onClick={() => {
                        setShowIsbnImport(false);
                        setIsbnImportValue('');
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            <form className="book-form-modal__form" onSubmit={handleSubmit}>
              {/* Title Field */}
              <div className="book-form-modal__field">
                <label htmlFor="book-title" className="book-form-modal__label">
                  Book Title *
                </label>
                <input
                  id="book-title"
                  type="text"
                  className={`book-form-modal__input ${errors.title ? 'book-form-modal__input--error' : ''}`}
                  placeholder="Enter book title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <span className="book-form-modal__error">{errors.title}</span>
                )}
              </div>

              {/* Author Dropdown */}
              <div className="book-form-modal__field">
                <label htmlFor="book-author" className="book-form-modal__label">
                  Author *
                </label>
                {authorsLoading ? (
                  <div className="book-form-modal__loading-select">Loading authors...</div>
                ) : (
                  <select
                    id="book-author"
                    className={`book-form-modal__select ${errors.authorId ? 'book-form-modal__select--error' : ''}`}
                    value={formData.authorId}
                    onChange={(e) => handleInputChange('authorId', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Select an author</option>
                    {authors?.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.authorId && (
                  <span className="book-form-modal__error">{errors.authorId}</span>
                )}
              </div>

              {/* ISBN Field */}
              <div className="book-form-modal__field">
                <label htmlFor="book-isbn" className="book-form-modal__label">
                  ISBN *
                </label>
                <input
                  id="book-isbn"
                  type="text"
                  className={`book-form-modal__input book-form-modal__input--mono ${errors.isbn ? 'book-form-modal__input--error' : ''}`}
                  placeholder="978-3-16-148410-0"
                  value={formData.isbn}
                  onChange={(e) => handleInputChange('isbn', e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.isbn && (
                  <span className="book-form-modal__error">{errors.isbn}</span>
                )}
              </div>

              {/* Publication Year Field */}
              <div className="book-form-modal__field">
                <label htmlFor="book-year" className="book-form-modal__label">
                  Publication Year *
                </label>
                <input
                  id="book-year"
                  type="number"
                  className={`book-form-modal__input ${errors.year ? 'book-form-modal__input--error' : ''}`}
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  disabled={isSubmitting}
                  min="1000"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && (
                  <span className="book-form-modal__error">{errors.year}</span>
                )}
              </div>

              {/* Genre Field */}
              <div className="book-form-modal__field">
                <label htmlFor="book-genre" className="book-form-modal__label">
                  Genre
                </label>
                <input
                  id="book-genre"
                  type="text"
                  className={`book-form-modal__input ${errors.genre ? 'book-form-modal__input--error' : ''}`}
                  placeholder="Fiction, Mystery, Science Fiction, etc."
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.genre && (
                  <span className="book-form-modal__error">{errors.genre}</span>
                )}
              </div>

              {/* Form Actions */}
              <div className="book-form-modal__actions">
                <button
                  type="button"
                  className="book-form-modal__action-btn book-form-modal__action-btn--cancel"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="book-form-modal__action-btn book-form-modal__action-btn--submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="book-form-modal__spinner" />
                      {isEditMode ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>{isEditMode ? '✓ Update Book' : '+ Add Book'}</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
