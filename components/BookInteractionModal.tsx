// BookInteractionModal component placeholder
// components/BookInteractionModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type ShelfBook = {
  id: string;
  title?: string;
  author?: string;
  dueDate?: Date;
};

type Props = {
  visible: boolean;
  book: ShelfBook | null;
  onClose: () => void;
  onReturn: (id: string) => Promise<void>;
  onExtend: (id: string) => Promise<void>;
};

export default function BookInteractionModal({ visible, book, onClose, onReturn, onExtend }: Props) {
  if (!book) return null;
  const today = new Date();
  const currentDue = book.dueDate ?? new Date();
  const newDue = new Date(currentDue);
  newDue.setDate(newDue.getDate() + 7);
  const isOverdue = currentDue < today;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>by {book.author}</Text>

          <View style={[styles.dueBox, isOverdue ? styles.dueOver : styles.dueOk]}>
            <Text style={{ fontWeight: '600' }}>Current Due Date:</Text>
            <Text>{currentDue.toDateString()}</Text>
            {isOverdue && <Text style={{ marginTop: 6, color: '#6b0b0b' }}>⚠️ OVERDUE - Please return or extend immediately.</Text>}
          </View>

          <TouchableOpacity style={[styles.btn, styles.primary]} onPress={() => onExtend(book.id)}>
            <Text style={styles.btnText}>Extend Loan by 7 Days</Text>
            <Text style={{ fontSize: 12, color: '#fff', marginTop: 4 }}>New Due: {newDue.toDateString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.danger]} onPress={() => onReturn(book.id)}>
            <Text style={styles.btnText}>Return Book</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.neutral]} onPress={onClose}>
            <Text style={{ color: '#333' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  card: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  author: { fontSize: 12, color: '#666', marginBottom: 8 },
  dueBox: { padding: 12, borderRadius: 8, marginBottom: 12 },
  dueOk: { backgroundColor: '#ecfdf5' },
  dueOver: { backgroundColor: '#fff1f2' },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primary: { backgroundColor: '#4f46e5' },
  danger: { backgroundColor: '#e11d48' },
  neutral: { backgroundColor: '#eee' },
  btnText: { color: '#fff', fontWeight: '700' }
});
