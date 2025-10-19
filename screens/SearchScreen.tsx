import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../styles/SearchScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png'; 

const MOCK_LIBRARY = [
  { id: '1', title: 'มติชน', author: 'Matichon Staff', genre: 'หนังสือพิมพ์', cover: 'https://upload.wikimedia.org/wikipedia/th/5/50/Matichon_Logo.png' },
  { id: '2', title: 'ชีวจิต', author: 'ชีวจิตทีม', genre: 'นิตยสารสุขภาพ', cover: 'https://upload.wikimedia.org/wikipedia/th/3/36/Chivajit_magazine_cover.jpg' },
  { id: '3', title: 'The Silent Code', author: 'Aria Thorne', genre: 'นิยาย', cover: 'https://picsum.photos/200/300?random=1' }
];

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function SearchScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const filtered = MOCK_LIBRARY.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.author.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
      {/* 🔹 Header ครอบ Search Bar */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ค้นหา</Text>
          <Image
            source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }}
            style={styles.profileImage}
          />
        </View>

        {/* 🔹 Search Bar */}
        <View style={styles.searchBar}>
          <Image source={SearchIcon} style={styles.searchIcon} resizeMode="contain" />
          <TextInput
            style={styles.input}
            placeholder="ชื่อหนังสือ หรือชื่อผู้แต่ง"
            placeholderTextColor="#386156"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </View>

      {/* 🔹 ผลลัพธ์ */}
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
