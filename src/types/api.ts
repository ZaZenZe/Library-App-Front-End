// ============================================
// API TYPE DEFINITIONS
// ============================================

export interface Book {
  id: number;
  title: string;
  authorId: number;
  isbn: string;
  publicationYear: number;
  genre: string;
  author?: Author; // Optional populated field
}

export interface Author {
  id: number;
  name: string;
  bio?: string;
  birthYear?: number;
}

export interface CreateBookDTO {
  title: string;
  authorId: number;
  isbn: string;
  publicationYear: number;
  genre: string;
}

export interface UpdateBookDTO {
  id: number;
  title: string;
  authorId: number;
  isbn: string;
  publicationYear: number;
  genre: string;
}

export interface CreateAuthorDTO {
  name: string;
  bio?: string;
  birthYear?: number;
}

export interface UpdateAuthorDTO {
  id: number;
  name: string;
  bio?: string;
  birthYear?: number;
}

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
