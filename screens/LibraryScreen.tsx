// screens/LibraryScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  summary: string;
  releaseDate: string;
  cover: string;
};

type Props = {
  userId: string | null;
  shelfBooks: any[];
};

const MOCK_LIBRARY: Book[] = [
  {
    id: '1',
    title: 'มติชน',
    author: 'Matichon Staff',
    genre: 'หนังสือพิมพ์',
    summary: 'สำนักข่าวรายวันของประเทศไทย ครอบคลุมข่าวทั่วโลก',
    releaseDate: '2024-03-01',
    cover: 'https://upload.wikimedia.org/wikipedia/th/5/50/Matichon_Logo.png'
  },
  {
    id: '2',
    title: 'ชีวจิต',
    author: 'ชีวจิตทีม',
    genre: 'นิตยสารสุขภาพ',
    summary: 'เนื้อหาเกี่ยวกับสุขภาพ ร่างกาย และจิตใจ',
    releaseDate: '2024-02-10',
    cover: 'https://upload.wikimedia.org/wikipedia/th/3/36/Chivajit_magazine_cover.jpg'
  },
  {
    id: '3',
    title: 'The Silent Code',
    author: 'Aria Thorne',
    genre: 'นิยาย',
    summary: 'เรื่องราวของนักวิทยาศาสตร์ที่ค้นพบรหัสลับอันตราย',
    releaseDate: '2023-12-15',
    cover: 'https://picsum.photos/200/300?random=1'
  }
];

export default function LibraryScreen({ userId, shelfBooks }: Props) {
  const navigation = useNavigation<any>();

  const groupedGenres = useMemo(() => {
    const groups: Record<string, Book[]> = {};
    MOCK_LIBRARY.forEach((book) => {
      if (!groups[book.genre]) groups[book.genre] = [];
      groups[book.genre].push(book);
    });
    return Object.entries(groups);
  }, []);

  const renderGenre = ({ item }: { item: [string, Book[]] }) => {
    const [genre, books] = item;
    return (
      <View style={styles.genreSection}>
        <Text style={styles.genreTitle}>{genre}</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={books}
          keyExtractor={(b) => b.id}
          renderItem={({ item: book }) => (
            <Pressable
              onPress={() => navigation.navigate('BookDetail', { book })}
              style={styles.bookCard}
            >
              <Image source={{ uri: book.cover }} style={styles.cover} />
              <Text style={styles.title} numberOfLines={1}>
                {book.title}
              </Text>
            </Pressable>
          )}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={groupedGenres}
      renderItem={renderGenre}
      keyExtractor={(i) => i[0]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#004d61',
    paddingVertical: 30,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  headerSubtitle: { color: '#e0e0e0', marginTop: 6, fontSize: 14 },
  genreSection: { marginTop: 20 },
  genreTitle: { fontSize: 20, fontWeight: '700', color: '#004d61', marginLeft: 16, marginBottom: 8 },
  bookCard: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginLeft: 16,
    marginRight: 8,
    elevation: 3,
    padding: 6
  },
  cover: { width: '100%', height: 160, borderRadius: 8 },
  title: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 6 }
});
