// ============================================
// API SERVICE - Core HTTP Client
// ============================================

import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { Book, Author, CreateBookDTO, UpdateBookDTO, CreateAuthorDTO, UpdateAuthorDTO } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://library-app-dot-net.onrender.com';

// ============================================
// AXIOS INSTANCE CONFIGURATION
// ============================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add auth token if needed in the future
apiClient.interceptors.request.use(
  (config) => {
    // Future: Add authorization token here
    // const token = localStorage.getItem('authToken');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// BOOKS API
// ============================================

export const booksAPI = {
  /**
   * Fetch all books
   * GET /books
   */
  getAll: async (): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>('/books');
    return response.data;
  },

  /**
   * Fetch single book by ID
   * GET /books/{id}
   */
  getById: async (id: number): Promise<Book> => {
    const response = await apiClient.get<Book>(`/books/${id}`);
    return response.data;
  },

  /**
   * Fetch book by ISBN
   * GET /books/isbn/{isbn}
   */
  getByISBN: async (isbn: string): Promise<Book> => {
    const response = await apiClient.get<Book>(`/books/isbn/${isbn}`);
    return response.data;
  },

  /**
   * Create new book
   * POST /books
   */
  create: async (book: CreateBookDTO): Promise<Book> => {
    const response = await apiClient.post<Book>('/books', book);
    return response.data;
  },

  /**
   * Update existing book
   * PUT /books/{id}
   */
  update: async (id: number, book: UpdateBookDTO): Promise<Book> => {
    const response = await apiClient.put<Book>(`/books/${id}`, book);
    return response.data;
  },

  /**
   * Delete book
   * DELETE /books/{id}
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/books/${id}`);
  },

  /**
   * Import book by ISBN
   * POST /books/import/isbn/{isbn}
   */
  importByISBN: async (isbn: string): Promise<Book> => {
    const response = await apiClient.post<Book>(`/books/import/isbn/${isbn}`);
    return response.data;
  },
};

// ============================================
// AUTHORS API
// ============================================

export const authorsAPI = {
  /**
   * Fetch all authors
   * GET /authors
   */
  getAll: async (): Promise<Author[]> => {
    const response = await apiClient.get<Author[]>('/authors');
    return response.data;
  },

  /**
   * Fetch single author by ID
   * GET /authors/{id}
   */
  getById: async (id: number): Promise<Author> => {
    const response = await apiClient.get<Author>(`/authors/${id}`);
    return response.data;
  },

  /**
   * Create new author
   * POST /authors
   */
  create: async (author: CreateAuthorDTO): Promise<Author> => {
    const response = await apiClient.post<Author>('/authors', author);
    return response.data;
  },

  /**
   * Update existing author
   * PUT /authors/{id}
   */
  update: async (id: number, author: UpdateAuthorDTO): Promise<Author> => {
    const response = await apiClient.put<Author>(`/authors/${id}`, author);
    return response.data;
  },

  /**
   * Delete author
   * DELETE /authors/{id}
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/authors/${id}`);
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.title) {
      return error.response.data.title;
    }
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Check if API is reachable
 */
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get('/books');
    return true;
  } catch {
    return false;
  }
};

export default apiClient;
