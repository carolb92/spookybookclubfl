const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

export interface GoogleBookVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  pageCount?: number;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
}

export interface GoogleBook {
  id: string;
  volumeInfo: GoogleBookVolumeInfo;
}

interface GoogleBooksApiResponse {
  items?: GoogleBook[];
  totalItems?: number;
  kind?: string;
}

export async function searchBooks(query: string, signal?: AbortSignal): Promise<GoogleBook[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=20`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Response status: ${response.status}`);
  const result: GoogleBooksApiResponse = await response.json();
  return result.items ?? [];
}
