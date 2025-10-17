// useShelfBooks hook placeholder
// hooks/useShelfBooks.ts
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import Constants from 'expo-constants';

type ShelfBook = {
  id: string;
  bookId?: string;
  title?: string;
  author?: string;
  genre?: string;
  summary?: string;
  borrowDate?: Date;
  dueDate?: Date;
};

const getUserShelfPath = (userId: string) => {
  const appId = (Constants.manifest?.extra?.appId as string) ?? 'default-app-id';
  return `artifacts/${appId}/users/${userId}/books_on_shelf`;
};

export default function useShelfBooks(userId: string | null, isAuthReady: boolean) {
  const [shelfBooks, setShelfBooks] = useState<ShelfBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId || !isAuthReady) {
      setShelfBooks([]);
      setIsLoading(false);
      return;
    }

    const col = collection(db, getUserShelfPath(userId));
    const q = query(col);

    const unsub = onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
      const books = snap.docs.map(d => {
        const data = d.data();
        const borrowDate = data.borrowDate && (data.borrowDate.toDate ? data.borrowDate.toDate() : new Date(data.borrowDate));
        const dueDate = data.dueDate && (data.dueDate.toDate ? data.dueDate.toDate() : new Date(data.dueDate));
        return {
          id: d.id,
          ...data,
          borrowDate,
          dueDate
        } as ShelfBook;
      });

      // sort by dueDate ascending
      books.sort((a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0));
      setShelfBooks(books);
      setIsLoading(false);
    }, (err) => {
      console.warn('useShelfBooks snapshot error', err);
      setIsLoading(false);
    });

    return () => unsub();
  }, [userId, isAuthReady]);

  return { shelfBooks, isLoading };
}
