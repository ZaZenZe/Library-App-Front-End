// ============================================
// API TYPE DEFINITIONS (Backend Response Types)
// ============================================

/**
 * Publisher as returned by API (nested in Book)
 */
export interface Publisher {
  id: number;
  name: string;
}

/**
 * Author as returned by API
 * IMPORTANT: When fetching from /authors, includes books array
 * When nested in Book response, books array may cause circular references
 */
export interface Author {
  id: number;
  name: string;
  books?: Book[]; // Present in GET /authors, avoid displaying full nested books
}

/**
 * Book Details as returned by Google Books API import
 * Contains extended metadata about the book
 */
export interface BookDetails {
  id: number; // Primary key
  bookId: number; // FK to Book
  description?: string | null; // Book description/summary
  smallThumbnail?: string | null; // Smallest thumbnail URL
  thumbnail?: string | null; // Standard thumbnail URL
}

/**
 * Book as returned by API
 * IMPORTANT: Always includes nested author object
 * May include nested publisher object (can be null)
 * May include details object if imported from Google Books
 */
export interface Book {
  id: number;
  title: string;
  isbn: string;
  year: number; // API uses 'year', not 'publicationYear'
  authorId: number; // Internal FK - don't display to users
  publisherId?: number | null; // Internal FK - don't display to users
  author: Author; // ALWAYS present in API response
  publisher?: Publisher | null; // May be null
  details?: BookDetails | null; // Extended metadata from Google Books
}

// ============================================
// DTO TYPES (for API requests)
// ============================================

export interface CreateBookDTO {
  title: string;
  authorName: string; // Author name as string (backend will find or create)
  isbn: string;
  year: number;
  publisherId?: number | null; // Optional publisher
  publisherName?: string; // For creating new publisher
  description?: string; // Optional description
  thumbnail?: string; // Optional cover image URL
  smallThumbnail?: string; // Optional small cover image URL
}

export interface UpdateBookDTO {
  title: string;
  authorName: string; // Author name as string
  isbn: string;
  year: number;
  publisherId?: number | null;
  publisherName?: string;
  description?: string;
  thumbnail?: string;
  smallThumbnail?: string;
}

export interface CreateAuthorDTO {
  name: string;
  bio?: string;
}

export interface UpdateAuthorDTO {
  name: string;
  bio?: string;
}

// ============================================
// DISPLAY TYPES (Frontend-only, transformed data)
// ============================================

/**
 * Simplified book data for display in cards/lists
 * Transforms nested API response to flat structure
 */
export interface BookDisplay {
  id: number;
  title: string;
  isbn: string;
  year: number;
  authorName: string; // Extracted from book.author.name
  publisherName: string | null; // Extracted from book.publisher?.name
}

/**
 * Simplified author data for display in cards/lists
 * Avoids circular reference issues
 */
export interface AuthorDisplay {
  id: number;
  name: string;
  bookCount: number; // Derived from author.books.length
  recentBooks: string[]; // Just titles, first 3
}

// ============================================
// UTILITY TRANSFORM FUNCTIONS
// ============================================

/**
 * Transform API Book to display-friendly format
 */
export const transformBook = (book: Book): BookDisplay => ({
  id: book.id,
  title: book.title,
  isbn: book.isbn,
  year: book.year,
  authorName: book.author?.name || 'Unknown Author',
  publisherName: book.publisher?.name || null,
});

/**
 * Transform API Author to display-friendly format
 */
export const transformAuthor = (author: Author): AuthorDisplay => ({
  id: author.id,
  name: author.name,
  bookCount: author.books?.length || 0,
  recentBooks: author.books?.slice(0, 3).map(b => b.title) || [],
});

export interface APIError {
  message: string;
  status?: number;
  details?: string;
}

export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
  loading: boolean;
}
