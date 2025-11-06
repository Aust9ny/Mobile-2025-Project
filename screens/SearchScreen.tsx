import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/SearchScreenStyle';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const DEFAULT_BOOK_COVER = 'https://via.placeholder.com/150x200/386156/FFFFFF?text=No+Cover';

const getBackendHost = () =>
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

// ✅ ฟังก์ชัน getTempUserId
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

// ✅ ฟังก์ชัน logBookView - บันทึกการดูหนังสือลง database
const logBookView = async (bookId: string) => {
  try {
    const userId = await getTempUserId();
    const backend = getBackendHost();
    
    const response = await fetch(`${backend}/api/books/mock/${bookId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`📖 [View Logged] Book ID: ${bookId}, View Count: ${data.data?.totalViews}`);
    }
  } catch (err) {
    console.error('Error logging book view:', err);
  }
};

export default function SearchScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = getBackendHost();

  // ------------------ Helper ------------------
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: any;
    return (...args: any[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const getValidImageUrl = (url: string | null | undefined): string => {
    if (!url || url.trim() === '') return DEFAULT_BOOK_COVER;
    if (url.startsWith('/')) return `${API_URL}${url}`;
    if (!/^https?:\/\//i.test(url)) return `${API_URL}/${url}`;
    return url;
  };

  const handleImageError = (bookId: string) => {
    setFilteredBooks(prev =>
      prev.map(b => (b.id === bookId ? { ...b, cover: DEFAULT_BOOK_COVER } : b))
    );
  };

  // ------------------ Fetch Books ------------------
  const fetchBooks = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/books/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // ✅ เตรียม URL ให้เสร็จในขั้นตอนนี้
      const booksWithValidCovers = (data.books || []).map((book: any) => ({
        ...book,
        cover: getValidImageUrl(book.cover),
      }));

      setFilteredBooks(booksWithValidCovers);
      
      console.log(`🔍 [Search] Query: "${query}" → ${booksWithValidCovers.length} results`);
    } catch (err) {
      console.error('Fetch error:', err);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchBooks = useCallback(debounce(fetchBooks, 400), []);

  // โหลดหนังสือทั้งหมดตอนเริ่มต้น
  useEffect(() => {
    fetchBooks('');
  }, []);

  // ค้นหาเมื่อ searchText เปลี่ยน
  useEffect(() => {
    if (searchText.trim() === '') {
      setShowSearchResult(false);
      fetchBooks('');
    } else {
      debouncedFetchBooks(searchText);
      setShowSearchResult(true);
    }
  }, [searchText]);

  const handleSubmitSearch = () => {
    Keyboard.dismiss();
    setShowSearchResult(true);
  };

  // ✅ ฟังก์ชันจัดการเมื่อกดดูหนังสือ
  const handleBookPress = async (book: any) => {
    // บันทึกการดูลง database
    await logBookView(book.id);
    
    // ไปหน้า BookDetail
    navigation.navigate('BookDetail', { book });
  };

  // ------------------ Render ------------------
  const renderFirstBook = (book: any) => (
    <TouchableOpacity
      key={book.id}
      style={styles.searchFirstBookContainer}
      onPress={() => handleBookPress(book)} // ✅ ใช้ handleBookPress
    >
      <Image
        source={{ uri: book.cover }}
        style={styles.searchFirstBookCover}
        onError={() => handleImageError(book.id)}
      />
      <Text style={styles.searchFirstBookTitle} numberOfLines={2}>
        {book.title || 'ไม่มีชื่อหนังสือ'}
      </Text>
      <Text style={styles.searchFirstBookAuthor} numberOfLines={1}>
        {book.author || 'ไม่ทราบผู้แต่ง'}
      </Text>
    </TouchableOpacity>
  );

  const renderGridBook = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.genreBookCard, { marginRight: (index + 1) % 3 === 0 ? 0 : 8 }]}
      onPress={() => handleBookPress(item)} // ✅ ใช้ handleBookPress
    >
      <Image
        source={{ uri: item.cover }}
        style={styles.genreBookCover}
        onError={() => handleImageError(item.id)}
      />
      <Text style={styles.genreBookTitle} numberOfLines={2}>
        {item.title || 'ไม่มีชื่อหนังสือ'}
      </Text>
      <Text style={styles.genreBookAuthor} numberOfLines={1}>
        {item.author || 'ไม่ทราบผู้แต่ง'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
      {/* Header */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ค้นหา</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
            <Image
              source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="ชื่อหนังสือ หรือชื่อผู้แต่ง"
            placeholderTextColor="#386156"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSubmitSearch}
          />
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#115566" />
          <Text style={{ marginTop: 10, color: '#666' }}>กำลังค้นหา...</Text>
        </View>
      ) : showSearchResult ? (
        filteredBooks.length > 0 ? (
          <FlatList
            data={filteredBooks.slice(1)}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{
              justifyContent: 'flex-start',
              paddingHorizontal: 16,
              marginTop: 16,
            }}
            renderItem={renderGridBook}
            ListHeaderComponent={
              <>
                <Text style={styles.searchResultHeader}>ผลการค้นหา</Text>
                {renderFirstBook(filteredBooks[0])}
              </>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <View style={styles.center}>
            <Text style={styles.emptyText}>ขออภัย</Text>
            <Text style={styles.emptyText}>ไม่เจอหนังสือที่ท่านต้องการหา</Text>
          </View>
        )
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 8,
            marginTop: 16,
          }}
          renderItem={renderGridBook}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}