import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Author, CreateAuthorDTO, UpdateAuthorDTO } from '../../types/api';
import { authorsAPI } from '../../services/api';
import './AuthorFormModal.scss';

interface AuthorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (author: Author) => void;
  editAuthor?: Author | null; // If provided, we're editing; otherwise, creating
}

interface FormData {
  name: string;
  bio: string;
}

interface FormErrors {
  name?: string;
  bio?: string;
}

export const AuthorFormModal: React.FC<AuthorFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editAuthor,
}) => {
  const isEditMode = !!editAuthor;
  const [formData, setFormData] = useState<FormData>({
    name: '',
    bio: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editAuthor) {
      setFormData({
        name: editAuthor.name,
        bio: '', // Bio not currently in Author model from API
      });
    } else {
      // Reset form when not editing
      setFormData({
        name: '',
        bio: '',
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [editAuthor, isOpen]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = 'Author name is required';
    }

    // Bio is optional per API

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let result: Author;

      if (isEditMode && editAuthor) {
        // Update existing author
        const updateData: UpdateAuthorDTO = {
          name: formData.name.trim(),
          // Bio field not yet implemented in API
        };
        result = await authorsAPI.update(editAuthor.id, updateData);
      } else {
        // Create new author
        const createData: CreateAuthorDTO = {
          name: formData.name.trim(),
          // Bio field not yet implemented in API
        };
        result = await authorsAPI.create(createData);
      }

      // Success!
      onSuccess?.(result);
      onClose();
    } catch (err) {
      console.error('Error submitting author:', err);
      const error = err as { response?: { data?: { error?: string; title?: string; detail?: string } } };
      
      // Handle ASP.NET problem details or simple error
      if (error.response?.data) {
        const data = error.response.data;
        setSubmitError(
          data.error || 
          (data.title ? `${data.title}: ${data.detail || ''}` : null) ||
          'Failed to save author'
        );
      } else {
        setSubmitError('Failed to save author. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="author-form-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="author-form-modal__content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="author-form-modal__close"
              onClick={onClose}
              aria-label="Close modal"
              disabled={isSubmitting}
            >
              ✕
            </button>

            <div className="author-form-modal__header">
              <h1 className="author-form-modal__title">
                {isEditMode ? 'Edit Author' : 'Add New Author'}
              </h1>
              <p className="author-form-modal__subtitle">
                {isEditMode
                  ? 'Update author information'
                  : 'Add a new author to your library'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="author-form">
              {submitError && (
                <div className="author-form__error-banner">
                  <span>⚠</span>
                  <p>{submitError}</p>
                </div>
              )}

              <div className="author-form__field">
                <label htmlFor="name" className="author-form__label">
                  Author Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Jane Austen"
                  className={`author-form__input ${errors.name ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className="author-form__error">{errors.name}</span>
                )}
              </div>

              <div className="author-form__field">
                <label htmlFor="bio" className="author-form__label">
                  Biography <span className="optional">(optional)</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief biography of the author..."
                  className={`author-form__textarea ${errors.bio ? 'error' : ''}`}
                  rows={6}
                  disabled={isSubmitting}
                />
                {errors.bio && (
                  <span className="author-form__error">{errors.bio}</span>
                )}
              </div>

              <div className="author-form__actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn--secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? isEditMode
                      ? 'Updating...'
                      : 'Adding...'
                    : isEditMode
                    ? 'Update Author'
                    : 'Add Author'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
