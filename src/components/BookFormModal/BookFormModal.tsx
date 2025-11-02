import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book, CreateBookDTO, UpdateBookDTO, BookSearchResult } from '../../types/api';
import { useCreateBook, useUpdateBook, useImportBook, useSearchBooks, useAuthors, useCreateAuthor } from '../../hooks/useAPI';
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
  const { data: authors } = useAuthors();
  const { createAuthor } = useCreateAuthor();

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
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentMaxResults, setCurrentMaxResults] = useState(10); // Start with 10 results
  const [canLoadMore, setCanLoadMore] = useState(false); // Track if more results might be available
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

  // Handle book selection from autocomplete - Use ISBN import endpoint
  const handleSelectBook = useCallback(async (book: BookSearchResult) => {
    // Close the autocomplete dropdown immediately
    setShowAutocomplete(false);
    setSearchResults([]);
    setSelectedIndex(-1);
    
    // If book has ISBN, use the import endpoint (backend handles everything)
    if (book.isbn) {
      const createdBook = await importBook(book.isbn);
      
      if (createdBook) {
        // Refresh authors list in case a new author was created
        onAuthorsRefresh?.();
        
        // Trigger success callback
        onSuccess?.(createdBook);
        
        // Close modal
        onClose();
        return;
      }
    }
    
    // Fallback: No ISBN or import failed - show error
    onError?.('Failed to add book. Missing ISBN or book already exists.');
  }, [importBook, onSuccess, onClose, onAuthorsRefresh, onError]);

  // Search books by title (debounced)
  useEffect(() => {
    const performSearch = async () => {
      // Only search if: 1) not in edit mode, 2) has 1+ chars, 3) input is focused
      if (debouncedTitle.trim().length >= 1 && !isEditMode && titleInputRef.current === document.activeElement) {
        // Start with 10 results when search query changes
        const resetMaxResults = 10;
        setCurrentMaxResults(resetMaxResults);
        const results = await searchBooks(debouncedTitle, resetMaxResults);
        setSearchResults(results);
        setShowAutocomplete(results.length > 0);
        // If we got 10 results, there might be more available (up to 40)
        setCanLoadMore(results.length === resetMaxResults);
      } else {
        setSearchResults([]);
        setShowAutocomplete(false);
        setCanLoadMore(false);
      }
    };

    performSearch();
  }, [debouncedTitle, searchBooks, isEditMode]);

  // Function to load more results - directly fetches with new limit
  const handleLoadMore = useCallback(async () => {
    if (!debouncedTitle.trim() || searching) return;
    
    const newMaxResults = Math.min(currentMaxResults + 10, 40); // Load 10 more, cap at 40
    setCurrentMaxResults(newMaxResults);
    
    // Fetch with the new limit
    const results = await searchBooks(debouncedTitle, newMaxResults);
    setSearchResults(results);
    // If results length equals what we asked for and we're not at cap, there might be more
    setCanLoadMore(results.length === newMaxResults && newMaxResults < 40);
  }, [debouncedTitle, currentMaxResults, searchBooks, searching]);

  // Click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node) &&
          titleInputRef.current && !titleInputRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close autocomplete when title input loses focus (but not when clicking dropdown)
  useEffect(() => {
    const handleBlur = () => {
      // Small delay to allow click on autocomplete items
      setTimeout(() => {
        if (document.activeElement !== titleInputRef.current && 
            !autocompleteRef.current?.contains(document.activeElement)) {
          setShowAutocomplete(false);
          setSelectedIndex(-1);
        }
      }, 150);
    };

    const titleInput = titleInputRef.current;
    if (titleInput) {
      titleInput.addEventListener('blur', handleBlur);
      return () => titleInput.removeEventListener('blur', handleBlur);
    }
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
      if (isNaN(year) || year < 0 || year > 3000) {
        newErrors.year = 'Year must be between 0 and 3000';
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

    try {
      // Step 1: Get or create author
      let authorId: number;
      const authorName = formData.authorName.trim();
      const existingAuthor = authors?.find(a => a.name.toLowerCase() === authorName.toLowerCase());
      
      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        // Create new author
        const newAuthor = await createAuthor({ name: authorName });
        if (!newAuthor) {
          onError?.('Failed to create author. Please try again.');
          return;
        }
        authorId = newAuthor.id;
        // Refresh authors list
        onAuthorsRefresh?.();
      }

      // Step 2: Handle publisher (if provided)
      // NOTE: Publisher management is NOT YET IMPLEMENTED in the backend
      // For now, we just keep existing publisherId or set to null
      let publisherId: number | null = null;
      if (isEditMode && editBook) {
        // Keep existing publisher ID when editing
        publisherId = editBook.publisherId || null;
      }
      // TODO: When backend adds /publishers endpoints, add publisher lookup/creation here
      // similar to author handling above

      // Step 3: Create or update book
      if (isEditMode && editBook) {
        // Update existing book - ALL required fields must be sent
        const updateData: UpdateBookDTO = {
          title: formData.title.trim(),
          authorId,
          isbn: formData.isbn.trim(),
          year: parseInt(formData.year),
          publisherId, // Use the resolved publisher ID
        };

        // Add optional fields - send null if empty to clear them
        updateData.description = formData.description.trim() || null;
        updateData.thumbnail = formData.thumbnail.trim() || null;
        updateData.smallThumbnail = editBook.details?.smallThumbnail || null;

        const result = await updateBook(editBook.id, updateData);

        if (result) {
          // Trigger success - this will refresh books AND authors
          onSuccess?.(result);
          onClose();
        } else {
          onError?.('Failed to update book. Please try again.');
        }
      } else {
        // Create new book
        const bookData: CreateBookDTO = {
          title: formData.title.trim(),
          authorId,
          isbn: formData.isbn.trim(),
          year: parseInt(formData.year),
          publisherId, // Use the resolved publisher ID (currently always null)
        };

        // Add optional fields if they have values
        if (formData.description.trim()) {
          bookData.description = formData.description.trim();
        }
        if (formData.thumbnail.trim()) {
          bookData.thumbnail = formData.thumbnail.trim();
        }

        const result = await createBook(bookData);

        if (result) {
          onSuccess?.(result);
          onClose();
        } else {
          onError?.('Failed to add book. Please try again.');
        }
      }
    } catch (error) {
      console.error('Book operation error:', error);
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
                          Books found from Google Books
                        </div>
                        <ul className="book-form-modal__autocomplete-list">
                          {searchResults.map((book, index) => (
                            <li
                              key={`${book.isbn}-${index}`}
                              className={`book-form-modal__autocomplete-item ${
                                index === selectedIndex ? 'book-form-modal__autocomplete-item--selected' : ''
                              }`}
                              onClick={() => handleSelectBook(book)}
                              onMouseEnter={() => setSelectedIndex(index)}
                            >
                              <div className="book-form-modal__autocomplete-item-image">
                                {book.thumbnail ? (
                                  <img 
                                    src={book.thumbnail} 
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
                                  {book.authors?.join(', ') || 'Unknown Author'} • {book.year || 'N/A'}
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
                        
                        {/* Load More Button */}
                        {canLoadMore && (
                          <div className="book-form-modal__autocomplete-footer">
                            <button
                              type="button"
                              className="book-form-modal__load-more"
                              onClick={handleLoadMore}
                              disabled={searching}
                            >
                              {searching ? 'Loading...' : 'Load More Books'}
                            </button>
                          </div>
                        )}
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
                  min="0"
                  max="3000"
                />
                {errors.year && (
                  <span className="book-form-modal__error">{errors.year}</span>
                )}
              </div>

              {/* Publisher Name Field - Read-only (only set via ISBN import) */}
              {formData.publisherName && (
                <div className="book-form-modal__field">
                  <label htmlFor="book-publisher" className="book-form-modal__label">
                    Publisher
                  </label>
                  <input
                    id="book-publisher"
                    type="text"
                    className="book-form-modal__input"
                    value={formData.publisherName}
                    readOnly
                    disabled
                    title="Publisher can only be set via ISBN import"
                  />
                </div>
              )}

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
