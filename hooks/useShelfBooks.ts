// hooks/useShelfBooks.ts
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000/api'; // Update with your backend URL

type ShelfBook = {
  id: string;
  book_id?: string;
  user_id?: string;
  title?: string;
  author?: string;
  genre?: string;
  summary?: string;
  borrow_date?: Date;
  due_date?: Date;
  return_date?: Date;
  status?: 'borrowed' | 'returned' | 'overdue';
};

export default function useShelfBooks(userId: string | null, token: string | null, isAuthReady: boolean) {
  const [shelfBooks, setShelfBooks] = useState<ShelfBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShelfBooks = async () => {
    if (!userId || !token || !isAuthReady) {
      setShelfBooks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/borrows/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch borrowed books');
      }
      
      const data = await response.json();
      const books = data.borrows || [];
      
      // Convert date strings to Date objects and sort
      const processedBooks = books.map((book: any) => ({
        ...book,
        borrow_date: book.borrow_date ? new Date(book.borrow_date) : null,
        due_date: book.due_date ? new Date(book.due_date) : null,
        return_date: book.return_date ? new Date(book.return_date) : null,
      }));
      
      // Sort by due date ascending (overdue first)
      processedBooks.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.getTime() - b.due_date.getTime();
      });
      
      setShelfBooks(processedBooks);
    } catch (err: any) {
      console.error('Error fetching shelf books:', err);
      setError(err.message);
      setShelfBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShelfBooks();
  }, [userId, token, isAuthReady]);

  const refreshBooks = () => {
    fetchShelfBooks();
  };

  const borrowBook = async (bookId: string) => {
    if (!token) return false;
    
    try {
      const response = await fetch(`${API_URL}/borrows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ book_id: bookId })
      });
      
      if (response.ok) {
        await refreshBooks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error borrowing book:', error);
      return false;
    }
  };

  const returnBook = async (borrowId: string) => {
    if (!token) return false;
    
    try {
      const response = await fetch(`${API_URL}/borrows/${borrowId}/return`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await refreshBooks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error returning book:', error);
      return false;
    }
  };

  return { 
    shelfBooks, 
    isLoading, 
    error,
    refreshBooks,
    borrowBook,
    returnBook
  };
}
