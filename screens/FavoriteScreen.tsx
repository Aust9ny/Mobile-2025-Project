import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { favoriteStyles as styles } from '../styles/FavoriteScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png';
import NoIcon from '../assets/healthicons_no.png';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const screenWidth = Dimensions.get('window').width;

export default function FavoriteScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('favoriteBooks');
        const parsed = stored ? JSON.parse(stored) : [];
        setFavorites(parsed);
        setFilteredBooks(parsed);
      } catch (error) {
        console.error('Failed to load favorites', error);
      }
    };
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation]);

  // filter เมื่อ searchText เปลี่ยน
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredBooks(favorites);
    } else {
      const filtered = favorites.filter(
        (book) =>
          book.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchText, favorites]);

  const renderGridBook = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.genreBookCard, { marginRight: (index + 1) % 3 === 0 ? 0 : 8 }]}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Image source={{ uri: item.cover || DEFAULT_PROFILE }} style={styles.genreBookCover} />
      <Text style={styles.genreBookTitle}>{item.title}</Text>
      <Text style={styles.genreBookAuthor}>{item.author}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
      {/* Header */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>รายการโปรด</Text>
          <Image
            source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }}
            style={styles.profileImage}
          />
        </View>

        {/* Search Bar */}
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

      {/* Grid Books */}
      {filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: 'flex-start', paddingHorizontal: 16, marginTop: 16 }}
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
