import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { favoriteStyles as styles } from '../styles/FavoriteScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png';
import NoIcon from '../assets/healthicons_no.png';

const DEFAULT_COVER = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const getBackendHost = () =>
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export default function FavoriteScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const userId = 1;

  const loadFavorites = async () => {
    try {
      const backend = getBackendHost();
      const res = await fetch(`${backend}/api/users/${userId}/favorites`);
      const data = await res.json();
      if (res.ok && data.favorites) {
        setFavorites(data.favorites);
        setFilteredBooks(data.favorites);
      }
    } catch (err) {
      console.error('[FavoriteScreen] Failed to load favorites', err);
    }
  };

  // โหลดทุกครั้งที่หน้า focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  // ฟังก์ชันให้ BookDetailScreen อัปเดต favorites
  const handleFavoriteChange = async (bookId: number, action: 'add' | 'remove') => {
    if (action === 'remove') {
      setFavorites(prev => prev.filter(b => Number(b.id) !== Number(bookId)));
      setFilteredBooks(prev => prev.filter(b => Number(b.id) !== Number(bookId)));
    } else if (action === 'add') {
      // ถ้า add, fetch ใหม่จาก backend
      await loadFavorites();
    }
  };

  // กรอง search
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredBooks(favorites);
    } else {
      const filtered = favorites.filter(
        book =>
          book.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchText, favorites]);

  const renderGridBook = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.genreBookCard, { marginRight: (index + 1) % 3 === 0 ? 0 : 8 }]}
      onPress={() =>
        navigation.navigate('BookDetail', {
          book: item,
          onFavoriteChange: handleFavoriteChange,
        })
      }
    >
      <Image
        source={{ uri: item.cover || DEFAULT_COVER }}
        style={styles.genreBookCover}
      />
      <Text style={styles.genreBookTitle}>{item.title}</Text>
      <Text style={styles.genreBookAuthor}>{item.author}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
      <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>รายการโปรด</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
            <Image
              source={{ uri: userProfile?.photoURL || DEFAULT_COVER }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Image source={SearchIcon} style={styles.searchIcon} resizeMode="contain" />
          <TextInput
            style={styles.input}
            placeholder="ชื่อหนังสือ หรือชื่อผู้แต่ง"
            placeholderTextColor="#386156"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: 'flex-start',
            paddingHorizontal: 16,
            marginTop: 16,
          }}
          renderItem={renderGridBook}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>ขออภัย</Text>
          <Text style={styles.emptyText}>ท่านยังไม่ได้เพิ่มรายการโปรด</Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
        </View>
      )}
    </View>
  );
}
