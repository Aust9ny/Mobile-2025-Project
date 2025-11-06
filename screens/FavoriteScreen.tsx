import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { favoriteStyles as styles } from '../styles/FavoriteScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png';
import NoIcon from '../assets/healthicons_no.png';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const screenWidth = Dimensions.get('window').width;

const getBackendHost = () =>
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

const getTempUserId = async () => {
  try {
    let tempUserId = await AsyncStorage.getItem('temp_user_id');
    if (!tempUserId) {
      tempUserId = `temp_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('temp_user_id', tempUserId);
    }
    return tempUserId;
  } catch (error) {
    return `guest_${Date.now()}`;
  }
};

export default function FavoriteScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ โหลดรายการโปรดจาก database
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const userId = await getTempUserId();
      const backend = getBackendHost();
      
      console.log(`📡 [FavoriteScreen] Fetching favorites for user: ${userId}`);
      
      const res = await fetch(`${backend}/api/users/favorites/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ [FavoriteScreen] HTTP ${res.status}:`, errorText);
        throw new Error(`Failed to fetch favorites: ${res.status}`);
      }

      const data = await res.json();
      const favoriteList = data.favorites || [];
      
      setFavorites(favoriteList);
      setFilteredBooks(favoriteList);
      
      console.log(`✅ [FavoriteScreen] โหลด ${favoriteList.length} รายการโปรด`);
    } catch (error: any) {
      console.error('❌ [FavoriteScreen] Failed to load favorites:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดรายการโปรดได้');
      setFavorites([]);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ โหลดใหม่ทุกครั้งที่เข้าหน้านี้
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  // ✅ Filter เมื่อ searchText เปลี่ยน
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
      onPress={() => navigation.navigate('BookDetail', { 
        book: item,
        onFavoriteChange: (bookId: string, action: string) => {
          // Callback เมื่อกด favorite ใน BookDetailScreen
          if (action === 'remove') {
            // ลบออกจากรายการ
            setFavorites(prev => prev.filter(b => b.id !== bookId));
            setFilteredBooks(prev => prev.filter(b => b.id !== bookId));
          }
        }
      })}
    >
      <Image 
        source={{ uri: item.cover || DEFAULT_PROFILE }} 
        style={styles.genreBookCover} 
      />
      <Text style={styles.genreBookTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.genreBookAuthor} numberOfLines={1}>{item.author}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
      {/* Header */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>รายการโปรด</Text>

          {/* กดไปหน้า ProfileScreen */}
          <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
            <Image
              source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
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

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#115566" />
          <Text style={{ marginTop: 10, color: '#666' }}>กำลังโหลด...</Text>
        </View>
      ) : filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={3}
          columnWrapperStyle={{ 
            justifyContent: 'flex-start', 
            paddingHorizontal: 16, 
            marginTop: 16 
          }}
          renderItem={renderGridBook}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>ขออภัย</Text>
          <Text style={styles.emptyText}>
            {searchText ? 'ไม่พบหนังสือที่ค้นหา' : 'ท่านยังไม่ได้เพิ่มรายการโปรด'}
          </Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
        </View>
      )}
    </View>
  );
}