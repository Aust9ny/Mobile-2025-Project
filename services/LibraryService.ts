// LibraryService placeholder
// services/LibraryService.ts
import { collection, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import Constants from 'expo-constants';

const getUserShelfPath = (userId: string) => {
  const appId = (Constants.manifest?.extra?.appId as string) ?? 'default-app-id';
  return `artifacts/${appId}/users/${userId}/books_on_shelf`;
};

const borrowBook = async (userId: string, bookDetails: { bookId: string; title: string; author?: string; genre?: string; summary?: string; }) => {
  if (!db || !userId) return;
  const shelfPath = getUserShelfPath(userId);
  const due = new Date();
  due.setDate(due.getDate() + 14);
  const payload = {
    ...bookDetails,
    borrowDate: serverTimestamp(),
    dueDate: due
  };
  try {
    await addDoc(collection(db, shelfPath), payload);
  } catch (e) {
    console.warn('borrowBook error', e);
    throw e;
  }
};

const returnBook = async (userId: string, docId: string) => {
  if (!db || !userId || !docId) return;
  const d = doc(db, getUserShelfPath(userId), docId);
  try {
    await deleteDoc(d);
  } catch (e) {
    console.warn('returnBook error', e);
    throw e;
  }
};

const extendLoan = async (userId: string, docId: string, additionalDays = 7) => {
  if (!db || !userId || !docId) return;
  const d = doc(db, getUserShelfPath(userId), docId);
  try {
    const newDue = new Date();
    newDue.setDate(newDue.getDate() + additionalDays);
    await updateDoc(d, { dueDate: newDue });
  } catch (e) {
    console.warn('extendLoan error', e);
    throw e;
  }
};

export default {
  borrowBook,
  returnBook,
  extendLoan
};
