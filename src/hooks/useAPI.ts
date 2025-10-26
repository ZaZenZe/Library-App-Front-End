// ============================================
// CUSTOM API HOOKS
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { booksAPI, authorsAPI, getErrorMessage } from '../services/api';
import type { Book, Author, CreateBookDTO, UpdateBookDTO, CreateAuthorDTO, UpdateAuthorDTO, APIError } from '../types/api';

// Helper to safely extract status from error
const getErrorStatus = (err: unknown): number | undefined => {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { status?: number } }).response;
    return response?.status;
  }
  return undefined;
};

// ============================================
// GENERIC API HOOK
// ============================================

interface UseAPIOptions {
  immediate?: boolean; // Execute immediately on mount
}

interface UseAPIReturn<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
  execute: () => Promise<void>;
  reset: () => void;
}

/**
 * Generic hook for API calls with loading and error states
 */
export function useAPI<T>(
  apiFunction: () => Promise<T>,
  options: UseAPIOptions = { immediate: true }
): UseAPIReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(options.immediate || false);
  const [error, setError] = useState<APIError | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError({
        message: errorMessage,
        status: getErrorStatus(err),
      });
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return { data, loading, error, execute, reset };
}

// ============================================
// BOOKS HOOKS
// ============================================

/**
 * Fetch all books - with stable reference to prevent infinite loops
 */
export function useBooks() {
  const [data, setData] = useState<Book[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<APIError | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await booksAPI.getAll();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = getErrorMessage(err);
          setError({
            message: errorMessage,
            status: getErrorStatus(err),
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only fetch once on mount

  return { data, loading, error };
}

/**
 * Fetch single book by ID
 */
export function useBook(id: number, immediate = true) {
  const [data, setData] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<APIError | null>(null);

  const execute = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await booksAPI.getById(id);
      setData(result);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError({
        message: errorMessage,
        status: getErrorStatus(err),
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate && id) {
      execute();
    }
  }, [execute, immediate, id]);

  return { data, loading, error, execute, reset };
}

/**
 * Fetch book by ISBN
 */
export function useBookByISBN(isbn: string, immediate = false) {
  return useAPI(() => booksAPI.getByISBN(isbn), { immediate });
}

/**
 * Create new book
 */
export function useCreateBook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const createBook = useCallback(async (book: CreateBookDTO): Promise<Book | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await booksAPI.create(book);
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError({
        message: errorMessage,
        status: getErrorStatus(err),
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createBook, loading, error };
}

/**
 * Update existing book
 */
export function useUpdateBook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const updateBook = useCallback(async (id: number, book: UpdateBookDTO): Promise<Book | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await booksAPI.update(id, book);
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError({
        message: errorMessage,
        status: getErrorStatus(err),
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateBook, loading, error };
}

/**
 * Delete book
 */
export function useDeleteBook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const deleteBook = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await booksAPI.delete(id);
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError({
        message: errorMessage,
        status: getErrorStatus(err),
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteBook, loading, error };
}

/**
 * Import book by ISBN
 */
export function useImportBook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const importBook = useCallback(async (isbn: string): Promise<Book | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await booksAPI.importByISBN(isbn);
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError({
        message: errorMessage,
        status: getErrorStatus(err),
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { importBook, loading, error };
}

// ============================================
// AUTHORS HOOKS
// ============================================

/**
 * Fetch all authors - with stable reference to prevent infinite loops
 */
export function useAuthors() {
  const [data, setData] = useState<Author[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<APIError | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAuthors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await authorsAPI.getAll();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = getErrorMessage(err);
          setError({
            message: errorMessage,
            status: getErrorStatus(err),
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAuthors();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only fetch once on mount

  return { data, loading, error };
}

/**
 * Fetch single author by ID
 */
export function useAuthor(id: number, immediate = true) {
  return useAPI(() => authorsAPI.getById(id), { immediate });
}

/**
 * Create new author
 */
export function useCreateAuthor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const createAuthor = useCallback(async (author: CreateAuthorDTO): Promise<Author | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authorsAPI.create(author);
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError({
        message: errorMessage,
        status: getErrorStatus(err),
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createAuthor, loading, error };
}

/**
 * Update existing author
 */
export function useUpdateAuthor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const updateAuthor = useCallback(async (id: number, author: UpdateAuthorDTO): Promise<Author | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authorsAPI.update(id, author);
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError({
        message: errorMessage,
        status: getErrorStatus(err),
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateAuthor, loading, error };
}

/**
 * Delete author
 */
export function useDeleteAuthor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const deleteAuthor = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await authorsAPI.delete(id);
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError({
        message: errorMessage,
        status: getErrorStatus(err),
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteAuthor, loading, error };
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Get books by author ID
 */
export function useBooksByAuthor(authorId: number) {
  const { data: allBooks, loading, error } = useBooks();
  
  const booksByAuthor = allBooks?.filter(book => book.authorId === authorId) || [];
  
  return { books: booksByAuthor, loading, error };
}

/**
 * Search books with debouncing
 */
export function useBookSearch(searchTerm: string, delay = 300) {
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const { data: allBooks, loading, error } = useBooks();

  useEffect(() => {
    if (!allBooks) return;

    const timeoutId = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredBooks(allBooks);
        return;
      }

      const term = searchTerm.toLowerCase();
      const filtered = allBooks.filter(book => 
        book.title.toLowerCase().includes(term) ||
        book.isbn.toLowerCase().includes(term) ||
        book.author?.name.toLowerCase().includes(term)
      );
      
      setFilteredBooks(filtered);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, allBooks, delay]);

  return { books: filteredBooks, loading, error };
}
