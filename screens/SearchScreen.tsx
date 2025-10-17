// screens/SearchScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_LIBRARY = [
  { id: '1', title: 'มติชน', author: 'Matichon Staff', genre: 'หนังสือพิมพ์', cover: 'https://upload.wikimedia.org/wikipedia/th/5/50/Matichon_Logo.png' },
  { id: '2', title: 'ชีวจิต', author: 'ชีวจิตทีม', genre: 'นิตยสารสุขภาพ', cover: 'https://upload.wikimedia.org/wikipedia/th/3/36/Chivajit_magazine_cover.jpg' },
  { id: '3', title: 'The Silent Code', author: 'Aria Thorne', genre: 'นิยาย', cover: 'https://picsum.photos/200/300?random=1' }
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const filtered = MOCK_LIBRARY.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.author.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="ค้นหาหนังสือ..."
          placeholderTextColor="#386156"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
          >
            <Image source={{ uri: item.cover }} style={styles.cover} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
              <Text style={styles.genre}>{item.genre}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>ไม่พบผลลัพธ์ที่ตรงกับ "{query}"</Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCF8',
    paddingHorizontal: 16
  },
  searchBar: {
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10
  },
  input: {
    fontSize: 16,
    color: '#1E1E1E'
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    elevation: 2
  },
  cover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#D9D9D9'
  },
  title: {
    fontWeight: '700',
    color: '#115566',
    fontSize: 16
  },
  author: {
    color: '#386156',
    marginTop: 2
  },
  genre: {
    color: '#669886',
    fontSize: 12,
    marginTop: 4
  },
  empty: {
    textAlign: 'center',
    color: '#1E1E1E',
    marginTop: 40,
    fontSize: 16
  }
});
