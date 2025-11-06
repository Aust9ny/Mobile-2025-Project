import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Image, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import BookDetailScreen from './BookDetailScreen';
import SearchScreen from './SearchScreen';
import ProfileScreen from './ProfileScreen';
import FavoriteScreen from './FavoriteScreen';
import HistoryScreen from './HistoryScreen';
import ContactScreen from './ContactScreen';
import { styles } from '../styles/LibraryScreenStyle';

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
};

type Props = {
  userId?: string | null;
  shelfBooks?: Book[];
  userProfile?: { photoURL?: string };
};

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / 3;

const Stack = createNativeStackNavigator();

const API_URL = "http://192.168.1.132:4000";

// 🔹 ฟังก์ชันสร้าง/ดึง userId ชั่วคราว
const getTempUserId = async () => {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    let tempUserId = await AsyncStorage.getItem('temp_user_id');
    if (!tempUserId) {
      tempUserId = `temp_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('temp_user_id', tempUserId);
    }
    return tempUserId;
  } catch {
    return `guest_${Date.now()}`;
  }
};

// 🔹 ฟังก์ชันบันทึกการดูหนังสือ
const logBookView = async (bookId: string, userId: string | null | undefined) => {
  const effectiveUserId = userId || await getTempUserId();
  try {
    const response = await fetch(`${API_URL}/api/books/mock/${bookId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: effectiveUserId }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`📖 [View Logged] Book: ${bookId}, User View Count: ${data.data?.userViewCount}`);
    }
  } catch (err) {
    console.error('⌛ Log view error:', err);
  }
};

function GenreBooksScreen({ route, navigation }: any) {
  const { genre, books, userId } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
        <Text style={styles.backButtonArrow}>{'<'}</Text>
        <Text style={styles.backButtonText}>ย้อนกลับ</Text>
      </Pressable>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              logBookView(item.id, userId);
              navigation.navigate('BookDetail', { book: item });
            }}
            style={[styles.genreBookCard, { width: cardWidth }]}
          >
            <Image source={{ uri: item.cover }} style={styles.genreBookCover} />
            <Text style={styles.genreBookTitle}>{item.title}</Text>
            <Text style={styles.genreBookAuthor}>{item.author}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

function LibraryHome({ shelfBooks, userProfile, userId }: Props) {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'Home' | 'Categories'>('Home');
  const [libraryData, setLibraryData] = useState<Book[]>([]);
  const [recommendedCategories, setRecommendedCategories] = useState<Array<[string, Book[]]>>([]);
  const [latestCategories, setLatestCategories] = useState<Array<[string, Book[]]>>([]);
  const [recommendationType, setRecommendationType] = useState<'popular' | 'latest'>('latest');

  // 🔹 ดึงข้อมูลหนังสือทั้งหมด
  useEffect(() => {
    fetch(`${API_URL}/api/books/mock/all`)
      .then(res => res.json())
      .then(data => setLibraryData(data.books))
      .catch(err => console.error('Fetch books failed:', err));
  }, []);

  // 🔹 ดึงหนังสือแนะนำและหนังสือใหม่ล่าสุด
  useEffect(() => {
    if (libraryData.length === 0) return;

    const fetchRecommended = async () => {
      try {
        const response = await fetch(`${API_URL}/api/books/mock/stats/all`);
        const data = await response.json();

        const genreMap: Record<string, Book[]> = {};
        libraryData.forEach(book => {
          if (!genreMap[book.genre]) genreMap[book.genre] = [];
          genreMap[book.genre].push(book);
        });

        let recommended: Array<[string, Book[]]> = [];
        let latest: Array<[string, Book[]]> = [];

        if (data.topBooks && data.topBooks.length > 0 && data.topBooks[0].views > 0) {
          // แบ่งหนังสือยอดนิยมตามหมวด
          const topGenreMap: Record<string, Book[]> = {};
          data.topBooks.forEach((item: any) => {
            if (item.book) {
              const genre = item.book.genre;
              if (!topGenreMap[genre]) topGenreMap[genre] = [];
              topGenreMap[genre].push(item.book);
            }
          });
          recommended = Object.entries(topGenreMap)
            .slice(0, 3)
            .map(([g, b]) => [g, b.slice(0, 2)] as [string, Book[]]);
          setRecommendationType('popular');

          // หนังสือใหม่ล่าสุด แสดงหมวดอื่น 3 หมวด
          const allGenres = Object.entries(genreMap);
          latest = allGenres.filter(([g]) => !topGenreMap[g]).slice(0, 3).map(([g, b]) => [g, b.slice(0, 2)] as [string, Book[]]);
        } else {
          // ถ้าไม่มีหนังสือแนะนำ
          recommended = [];
          latest = Object.entries(genreMap).slice(0, 3).map(([g, b]) => [g, b.slice(0, 2)] as [string, Book[]]);
          setRecommendationType('latest');
        }

        setRecommendedCategories(recommended);
        setLatestCategories(latest);
      } catch (err) {
        console.error('Failed to fetch recommended books:', err);
      }
    };

    fetchRecommended();
  }, [libraryData]);

  const groupedGenres = useMemo(() => {
    const result: Record<string, Book[]> = {};
    libraryData.forEach(book => {
      if (!result[book.genre]) result[book.genre] = [];
      result[book.genre].push(book);
    });
    return Object.entries(result);
  }, [libraryData]);

  const handleBookPress = async (book: Book) => {
    await logBookView(book.id, userId);
    navigation.navigate('BookDetail', { book });
  };

  const renderGenre = ({ item }: { item: [string, Book[]] }) => {
    const [genre, books] = item;
    return (
      <View style={styles.genreSection}>
        <View style={styles.genreHeader}>
          <Text style={styles.genreTitle}>{genre}</Text>
          <Pressable
            onPress={() => navigation.navigate('GenreBooks', { genre, books, userId })}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
            <Text style={styles.seeAllText}>{' >'}</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {books.slice(0, 2).map(book => (
            <Pressable key={book.id} onPress={() => handleBookPress(book)} style={styles.homeBookCardLarge}>
              <Text style={styles.homeBookTitleLarge}>{book.title}</Text>
              <Image source={{ uri: book.cover }} style={styles.homeBookCoverLarge} resizeMode="cover" />
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const renderCategoryGenre = ({ item }: { item: [string, Book[]] }) => {
    const [genre, books] = item;
    return (
      <View style={styles.genreSection}>
        <View style={styles.genreHeader}>
          <Text style={styles.genreTitle}>{genre}</Text>
          <Pressable
            onPress={() => navigation.navigate('GenreBooks', { genre, books, userId })}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
            <Text style={styles.seeAllText}>{' >'}</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          {books.slice(0, 3).map((book, index) => (
            <Pressable
              key={book.id}
              onPress={() => handleBookPress(book)}
              style={[styles.genreBookCard, { width: cardWidth, marginRight: (index + 1) % 3 === 0 ? 0 : 8, marginBottom: 12 }]}
            >
              <Image source={{ uri: book.cover }} style={styles.genreBookCover} />
              <Text style={styles.genreBookTitle}>{book.title}</Text>
              <Text style={styles.genreBookAuthor}>{book.author}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.customHeader}>
        <Text style={styles.headerTitle}>ห้องสมุด</Text>
        <Pressable onPress={() => navigation.navigate('ProfileScreen')}>
          <Image source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }} style={styles.profileImage} resizeMode="cover" />
        </Pressable>
      </View>

      <View style={styles.subTabContainer}>
        {(['Home', 'Categories'] as const).map(tab => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.subTab}>
            <Text style={[styles.subTabText, activeTab === tab && styles.subTabActiveText]}>
              {tab === 'Home' ? 'หน้าแรก' : 'หมวดหมู่'}
            </Text>
            {activeTab === tab && <View style={styles.subTabIndicator} />}
          </Pressable>
        ))}
      </View>

      {activeTab === 'Home' && (
        <FlatList
          data={[
            // แสดง section หนังสือแนะนำ ถ้ามี
            ...(recommendedCategories.length > 0
              ? [{ type: 'section', title: recommendationType === 'popular' ? '🔥 หนังสือแนะนำ' : '✨ หนังสือใหม่ล่าสุด' },
                 ...recommendedCategories.map(g => ({ type: 'genre', data: g }))]
              : []),
            // หนังสือใหม่ล่าสุด
            { type: 'section', title: '✨ หนังสือใหม่ล่าสุด' },
            ...latestCategories.map(g => ({ type: 'genre', data: g })),
          ]}
          keyExtractor={(item, index) => item.type === 'section' ? `section-${index}` : `genre-${item.data[0]}-${index}`}
          renderItem={({ item }) => {
            if (item.type === 'section') {
              return (
                <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{item.title}</Text>
                </View>
              );
            }
            if (item.type === 'genre') {
              return renderGenre({ item: item.data as [string, Book[]] });
            }
            return null;
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === 'Categories' && (
        <FlatList
          data={groupedGenres}
          keyExtractor={(item, index) => `${item[0]}-${index}`}
          renderItem={renderCategoryGenre}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

export default function LibraryScreenStack({ userId, shelfBooks, userProfile }: Props) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LibraryHome" options={{ headerShown: false }}>
        {(props: any) => <LibraryHome {...props} userId={userId} shelfBooks={shelfBooks} userProfile={userProfile} />}
      </Stack.Screen>

      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{
          title: 'รายละเอียดหนังสือ',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#115566' },
        }}
      />

      <Stack.Screen name="GenreBooks" component={GenreBooksScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FavoriteScreen" component={FavoriteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HistoryScreen" options={{ headerShown: false }}>
        {(props: any) => <HistoryScreen {...props} userId={userId} />}
      </Stack.Screen>
      <Stack.Screen name="ContactScreen" component={ContactScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
