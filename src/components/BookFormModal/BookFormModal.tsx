import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book, CreateBookDTO, UpdateBookDTO } from '../../types/api';
import { useCreateBook, useUpdateBook, useImportBook, useSearchBooks } from '../../hooks/useAPI';
import { useDebounce } from '../../hooks/useDebounce';
import './BookFormModal.scss';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (book: Book) => void;
  onError?: (message: string) => void;
  editBook?: Book | null; // If provided, we're editing; otherwise, creating
  onAuthorsRefresh?: () => void; // Callback to refresh authors list
}

interface FormData {
  title: string;
  authorName: string; // Changed from authorId to authorName
  isbn: string;
  year: string;
  publisherName: string; // Publisher name
  description: string; // Book description
  thumbnail: string; // Cover image URL
}

interface FormErrors {
  title?: string;
  authorName?: string; // Changed from authorId to authorName
  isbn?: string;
  year?: string;
  publisherName?: string;
  description?: string;
  thumbnail?: string;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  editBook,
  onAuthorsRefresh,
}) => {
  const { createBook, loading: creating } = useCreateBook();
  const { updateBook, loading: updating } = useUpdateBook();
  const { importBook, loading: importing } = useImportBook();
  const { searchBooks, loading: searching } = useSearchBooks();

  const isEditMode = !!editBook;
  const [formData, setFormData] = useState<FormData>({
    title: '',
    authorName: '',
    isbn: '',
    year: '',
    publisherName: '',
    description: '',
    thumbnail: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isbnImportValue, setIsbnImportValue] = useState('');
  const [showIsbnImport, setShowIsbnImport] = useState(false);
  
  // Autocomplete state
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Debounce title input for search
  const debouncedTitle = useDebounce(formData.title, 400);

  // Populate form when editing
  useEffect(() => {
    if (editBook) {
      setFormData({
        title: editBook.title,
        authorName: editBook.author?.name || '',
        isbn: editBook.isbn,
        year: editBook.year.toString(),
        publisherName: editBook.publisher?.name || '',
        description: editBook.details?.description || '',
        thumbnail: editBook.details?.thumbnail || '',
      });
    } else {
      // Reset form when not editing
      setFormData({
        title: '',
        authorName: '',
        isbn: '',
        year: '',
        publisherName: '',
        description: '',
        thumbnail: '',
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

  // Handle book selection from autocomplete
  const handleSelectBook = useCallback((book: Book) => {
    // Auto-fill the form with selected book data
    setFormData({
      title: book.title,
      authorName: book.author?.name || '',
      isbn: book.isbn,
      year: book.year.toString(),
      publisherName: book.publisher?.name || '',
      description: book.details?.description || '',
      thumbnail: book.details?.thumbnail || book.details?.smallThumbnail || '',
    });
    setShowAutocomplete(false);
    setSearchResults([]);
    setSelectedIndex(-1);
    
    // Trigger success callback with the selected book (it's already in the database)
    onSuccess?.(book);
    onClose();
  }, [onSuccess, onClose]);

  // Search books by title (debounced)
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedTitle.trim().length >= 3 && !isEditMode) {
        const results = await searchBooks(debouncedTitle);
        setSearchResults(results);
        setShowAutocomplete(results.length > 0);
      } else {
        setSearchResults([]);
        setShowAutocomplete(false);
      }
    };

    performSearch();
  }, [debouncedTitle, searchBooks, isEditMode]);

  // Click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node) &&
          titleInputRef.current && !titleInputRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for autocomplete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showAutocomplete || searchResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectBook(searchResults[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
        setSelectedIndex(-1);
      }
    };

    if (showAutocomplete) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showAutocomplete, searchResults, selectedIndex, handleSelectBook]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.authorName.trim()) {
      newErrors.authorName = 'Author name is required';
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
      authorName: formData.authorName.trim(),
      isbn: formData.isbn.trim(),
      year: parseInt(formData.year),
      publisherName: formData.publisherName.trim() || undefined,
      description: formData.description.trim() || undefined,
      thumbnail: formData.thumbnail.trim() || undefined,
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
      // Book successfully imported and added to database!
      setShowIsbnImport(false);
      setIsbnImportValue('');
      // Refresh authors list in case a new author was created
      onAuthorsRefresh?.();
      // Close the modal and trigger success callback with the imported book
      onSuccess?.(result);
      onClose();
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
              {/* Title Field with Autocomplete */}
              <div className="book-form-modal__field book-form-modal__field--autocomplete">
                <label htmlFor="book-title" className="book-form-modal__label">
                  Book Title * {!isEditMode && <span className="book-form-modal__label-hint">(Start typing to search)</span>}
                </label>
                <div className="book-form-modal__autocomplete-wrapper">
                  <input
                    ref={titleInputRef}
                    id="book-title"
                    type="text"
                    className={`book-form-modal__input ${errors.title ? 'book-form-modal__input--error' : ''}`}
                    placeholder="Enter book title or search existing books..."
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    disabled={isSubmitting || isEditMode}
                    autoComplete="off"
                  />
                  {searching && !isEditMode && (
                    <div className="book-form-modal__search-indicator">
                      <span className="book-form-modal__spinner" />
                    </div>
                  )}
                  {errors.title && (
                    <span className="book-form-modal__error">{errors.title}</span>
                  )}
                  
                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showAutocomplete && searchResults.length > 0 && !isEditMode && (
                      <motion.div
                        ref={autocompleteRef}
                        className="book-form-modal__autocomplete"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="book-form-modal__autocomplete-header">
                          Found {searchResults.length} book{searchResults.length !== 1 ? 's' : ''} from Google Books
                        </div>
                        <ul className="book-form-modal__autocomplete-list">
                          {searchResults.map((book, index) => (
                            <li
                              key={book.id}
                              className={`book-form-modal__autocomplete-item ${
                                index === selectedIndex ? 'book-form-modal__autocomplete-item--selected' : ''
                              }`}
                              onClick={() => handleSelectBook(book)}
                              onMouseEnter={() => setSelectedIndex(index)}
                            >
                              <div className="book-form-modal__autocomplete-item-image">
                                {book.details?.thumbnail || book.details?.smallThumbnail ? (
                                  <img 
                                    src={book.details.thumbnail || book.details.smallThumbnail || ''} 
                                    alt={book.title}
                                  />
                                ) : (
                                  <div className="book-form-modal__autocomplete-item-placeholder">📖</div>
                                )}
                              </div>
                              <div className="book-form-modal__autocomplete-item-info">
                                <div className="book-form-modal__autocomplete-item-title">
                                  {book.title}
                                </div>
                                <div className="book-form-modal__autocomplete-item-meta">
                                  {book.author?.name} • {book.year}
                                </div>
                                {book.isbn && (
                                  <div className="book-form-modal__autocomplete-item-isbn">
                                    ISBN: {book.isbn}
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Author Name Field */}
              <div className="book-form-modal__field">
                <label htmlFor="book-author" className="book-form-modal__label">
                  Author *
                </label>
                <input
                  id="book-author"
                  type="text"
                  className={`book-form-modal__input ${errors.authorName ? 'book-form-modal__input--error' : ''}`}
                  placeholder="Stephen King, J.K. Rowling, etc."
                  value={formData.authorName}
                  onChange={(e) => handleInputChange('authorName', e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.authorName && (
                  <span className="book-form-modal__error">{errors.authorName}</span>
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

              {/* Publisher Name Field */}
              <div className="book-form-modal__field">
                <label htmlFor="book-publisher" className="book-form-modal__label">
                  Publisher
                </label>
                <input
                  id="book-publisher"
                  type="text"
                  className={`book-form-modal__input ${errors.publisherName ? 'book-form-modal__input--error' : ''}`}
                  placeholder="Penguin Random House, HarperCollins, etc."
                  value={formData.publisherName}
                  onChange={(e) => handleInputChange('publisherName', e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.publisherName && (
                  <span className="book-form-modal__error">{errors.publisherName}</span>
                )}
              </div>

              {/* Description Field */}
              <div className="book-form-modal__field">
                <label htmlFor="book-description" className="book-form-modal__label">
                  Description
                </label>
                <textarea
                  id="book-description"
                  className={`book-form-modal__textarea ${errors.description ? 'book-form-modal__input--error' : ''}`}
                  placeholder="A brief description of the book..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                />
                {errors.description && (
                  <span className="book-form-modal__error">{errors.description}</span>
                )}
              </div>

              {/* Cover Image URL Field */}
              <div className="book-form-modal__field">
                <label htmlFor="book-thumbnail" className="book-form-modal__label">
                  Cover Image URL
                </label>
                <input
                  id="book-thumbnail"
                  type="url"
                  className={`book-form-modal__input ${errors.thumbnail ? 'book-form-modal__input--error' : ''}`}
                  placeholder="https://example.com/book-cover.jpg"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.thumbnail && (
                  <span className="book-form-modal__error">{errors.thumbnail}</span>
                )}
                {formData.thumbnail && (
                  <div className="book-form-modal__thumbnail-preview">
                    <img src={formData.thumbnail} alt="Cover preview" />
                  </div>
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
