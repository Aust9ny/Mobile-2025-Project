// screens/BookDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import LibraryService from '../services/LibraryService';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function BookDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { book, userId } = route.params || {};

  if (!book) return null;

  const handleBorrow = async () => {
    try {
      await LibraryService.borrowBook(userId, {
        bookId: book.id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        summary: book.summary
      });
      alert('ยืมหนังสือสำเร็จ!');
      navigation.goBack();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการยืมหนังสือ');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: book.cover }} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>โดย {book.author}</Text>
        <Text style={styles.date}>เผยแพร่เมื่อ {book.releaseDate}</Text>
        <Text style={styles.summary}>{book.summary}</Text>
      </View>
      <Pressable style={styles.borrowBtn} onPress={handleBorrow}>
        <Text style={styles.borrowText}>ยืมหนังสือเล่มนี้</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  cover: { width: '100%', height: 350, resizeMode: 'cover' },
  info: { padding: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#004d61', marginBottom: 8 },
  author: { fontSize: 16, color: '#555', marginBottom: 6 },
  date: { fontSize: 14, color: '#777', marginBottom: 12 },
  summary: { fontSize: 16, color: '#333', lineHeight: 22 },
  borrowBtn: {
    backgroundColor: '#004d61',
    margin: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  borrowText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});
