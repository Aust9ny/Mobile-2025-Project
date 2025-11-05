import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../styles/SearchScreenStyle';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
// 🔹 รูปภาพ fallback สำหรับปกหนังสือที่โหลดไม่สำเร็จ
const DEFAULT_BOOK_COVER = 'https://via.placeholder.com/150x200/386156/FFFFFF?text=No+Cover';

export default function SearchScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 URL backend จริงของคุณ
  const API_URL = 'http://10.0.2.2:4000/api/books/search';

  // 🔹 debounce function
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: any;
    return (...args: any[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // 🔹 ฟังก์ชันตรวจสอบและแก้ไข URL รูปภาพ
  const getValidImageUrl = (url: string | null | undefined): string | null => {
    if (!url || url.trim() === '') {
      return DEFAULT_BOOK_COVER; // ถ้าไม่มี URL ให้ใช้ภาพ fallback
    }

    // ถ้าเป็น path (เช่น /uploads/book.jpg) ให้เติม domain
    if (url.startsWith('/')) {
      return `http://10.0.2.2:4000${url}`;
    }

    // ถ้าไม่มี http/https ให้เติม http://10.0.2.2:4000/
    if (!/^https?:\/\//i.test(url)) {
      return `http://10.0.2.2:4000/${url}`;
    }

    return url;
  };

  // 🔹 fetch books
  const fetchBooks = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // 🔹 ตรวจสอบและแก้ไข URL รูปภาพของหนังสือทุกเล่ม
      const booksWithValidCovers = (data.books || []).map((book: any) => ({
        ...book,
        cover: getValidImageUrl(book.cover),
      }));

      setFilteredBooks(booksWithValidCovers);
    } catch (err) {
      console.error('Fetch error:', err);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchBooks = useCallback(debounce(fetchBooks, 400), []);

  // 🔹 โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    fetchBooks('');
  }, []);

  // 🔹 filter เมื่อ searchText เปลี่ยน
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

  const renderFirstBook = (book: any) => (
    <TouchableOpacity
      key={book.id}
      style={styles.searchFirstBookContainer}
      onPress={() => navigation.navigate('BookDetail', { book })}
    >
      <Image
        source={{ uri: book.cover || DEFAULT_BOOK_COVER }}
        style={styles.searchFirstBookCover}
        onError={() => {
          console.log('Image load error for first book:', book.title);
          book.cover = DEFAULT_BOOK_COVER;
        }}
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
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Image
        source={{ uri: item.cover || DEFAULT_BOOK_COVER }}
        style={styles.genreBookCover}
        onError={() => {
          console.log('Image load error:', item.title);
          item.cover = DEFAULT_BOOK_COVER;
        }}
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
              onError={(e) => {
                console.log('Profile image load error:', e.nativeEvent.error);
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Image
            source={require('../assets/iconamoon_search-light.png')}
            style={styles.searchIcon}
            resizeMode="contain"
          />
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

      {/* แสดงผล */}
      {loading ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>กำลังโหลด...</Text>
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
            <Image
              source={require('../assets/healthicons_no.png')}
              style={[styles.emptyIcon, { tintColor: 'red' }]}
            />
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
