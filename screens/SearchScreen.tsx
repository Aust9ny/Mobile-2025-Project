import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../styles/SearchScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png';
import NoIcon from '../assets/healthicons_no.png';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const screenWidth = Dimensions.get('window').width;

export default function SearchScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [books, setBooks] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [showSearchResult, setShowSearchResult] = useState(false);

  // โหลดข้อมูลหนังสือ (จำลอง)
  useEffect(() => {
    const dummyBooks = [
      { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: 'https://picsum.photos/200/300', genre: 'Classic' },
      { id: 2, title: 'Pride and Prejudice', author: 'Jane Austen', cover: 'https://picsum.photos/200/301', genre: 'Romance' },
      { id: 3, title: '1984', author: 'George Orwell', cover: 'https://picsum.photos/200/302', genre: 'Dystopian' },
      { id: 4, title: 'To Kill a Mockingbird', author: 'Harper Lee', cover: 'https://picsum.photos/200/303', genre: 'Classic' },
    ];
    setBooks(dummyBooks);
    setFilteredBooks(dummyBooks);
  }, []);

  // filter เมื่อ searchText เปลี่ยน
  useEffect(() => {
    if (searchText.trim() === '') {
      // กลับไปหน้า default
      setShowSearchResult(false);
      setFilteredBooks(books);
    } else {
      const filtered = books.filter((book) =>
        book.title.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchText, books]);

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
      <Image source={{ uri: book.cover }} style={styles.searchFirstBookCover} />
      <Text style={styles.searchFirstBookTitle}>{book.title}</Text>
      <Text style={styles.searchFirstBookAuthor}>{book.author}</Text>
    </TouchableOpacity>
  );

  const renderGridBook = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.genreBookCard, { marginRight: (index + 1) % 3 === 0 ? 0 : 8 }]}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Image source={{ uri: item.cover }} style={styles.genreBookCover} />
      <Text style={styles.genreBookTitle}>{item.title}</Text>
      <Text style={styles.genreBookAuthor}>{item.author}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
      {/* 🔹 Header */}
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
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSubmitSearch}
          />
        </View>
      </View>

      {/* 🔹 แสดงผล */}
      {showSearchResult ? (
        filteredBooks.length > 0 ? (
          <FlatList
            data={filteredBooks.slice(1)} // แสดง grid สำหรับเล่มถัดไป
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            key={3}
            columnWrapperStyle={{ justifyContent: 'flex-start', paddingHorizontal: 16, marginTop: 16 }}
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
            <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
          </View>
        )
      ) : (
        // หน้า default
        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          key={3}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 8, marginTop: 16 }}
          renderItem={renderGridBook}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}
