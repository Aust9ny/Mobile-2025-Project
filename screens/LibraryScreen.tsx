import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Image, Dimensions, Platform } from 'react-native';
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
  available: number;
  borrowed: number;
  total: number;
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

// 🔹 กำหนด base URL สำหรับ backend
const BACKEND_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BACKEND_URL = `http://${BACKEND_HOST}:4000`;

// 🔹 ฟังก์ชันสร้าง/ดึง userId ชั่วคราวสำหรับทดสอบ
const getTempUserId = async () => {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    let tempUserId = await AsyncStorage.getItem('temp_user_id');
    
    if (!tempUserId) {
      tempUserId = `temp_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('temp_user_id', tempUserId);
      console.log('🆕 Created temp userId:', tempUserId);
    }
    
    return tempUserId;
  } catch (error) {
    return `guest_${Date.now()}`;
  }
};

// 🔹 ฟังก์ชันบันทึกการดูหนังสือ
const logBookView = async (bookId: string, userId: string | null | undefined) => {
  const effectiveUserId = userId || await getTempUserId();

  try {
    const response = await fetch(`${BACKEND_URL}/api/books/mock/${bookId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: effectiveUserId }),
    });

    if (!response.ok) {
      console.error('Failed to log view:', response.status);
      return;
    }

    const data = await response.json();
    console.log('✅ View logged:', data);
  } catch (err) {
    console.error('❌ Log view error:', err);
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
  const [recommendationType, setRecommendationType] = useState<'popular' | 'latest'>('latest');

  // 🔹 ดึงข้อมูลหนังสือจาก backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/books/mock/all`)
      .then(res => res.json())
      .then(data => setLibraryData(data.books))
      .catch(err => console.error('Fetch books failed:', err));
  }, []);

  // 🔹 State สำหรับหนังสือใหม่ล่าสุด (แยกจากหนังสือแนะนำ)
  const [latestCategories, setLatestCategories] = useState<Array<[string, Book[]]>>([]);

  // 🔹 ดึงหนังสือแนะนำแบบแยกหมวดหมู่ (3 หมวด, หมวดละ 2 เล่ม)
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/books/mock/stats/all`);
        const data = await response.json();
        
        // ถ้ามีหนังสือที่มียอดเข้าชม
        if (data.topBooks && data.topBooks.length > 0 && data.topBooks[0].views > 0) {
          // แบ่งหนังสือยอดนิยมตามหมวดหมู่
          const genreMap: Record<string, Book[]> = {};
          
          data.topBooks.forEach((item: any) => {
            if (item.book) {
              const genre = item.book.genre;
              if (!genreMap[genre]) {
                genreMap[genre] = [];
              }
              genreMap[genre].push(item.book);
            }
          });

          // เอาแค่ 3 หมวดแรกที่มียอดดูมากที่สุด
          const sortedGenres = Object.entries(genreMap)
            .slice(0, 3)
            .map(([genre, books]) => [genre, books.slice(0, 2)] as [string, Book[]]);
          
          setRecommendedCategories(sortedGenres);
          setRecommendationType('popular');
        } else {
          // ถ้ายังไม่มียอดเข้าชม ให้แสดงหนังสือใหม่ล่าสุด (3 หมวดหมู่)
          const genreMap: Record<string, Book[]> = {};
          
          libraryData.forEach((book) => {
            if (!genreMap[book.genre]) {
              genreMap[book.genre] = [];
            }
            genreMap[book.genre].push(book);
          });

          // เอา 3 หมวดแรก
          const latestGenres = Object.entries(genreMap)
            .slice(0, 3)
            .map(([genre, books]) => [genre, books.slice(0, 2)] as [string, Book[]]);
          
          setRecommendedCategories(latestGenres);
          setRecommendationType('latest');
        }

        // 🆕 ดึงหนังสือใหม่ล่าสุดอีก 3 หมวด (แยกจากหนังสือแนะนำ)
        const genreMap: Record<string, Book[]> = {};
        
        libraryData.forEach((book) => {
          if (!genreMap[book.genre]) {
            genreMap[book.genre] = [];
          }
          genreMap[book.genre].push(book);
        });

        // เอาหมวดที่ 4-6 หรือ 1-3 ถ้ายังไม่มียอดเข้าชม
        const startIndex = (data.topBooks && data.topBooks.length > 0 && data.topBooks[0].views > 0) ? 3 : 0;
        const newLatestGenres = Object.entries(genreMap)
          .slice(startIndex, startIndex + 3)
          .map(([genre, books]) => [genre, books.slice(0, 2)] as [string, Book[]]);
        
        setLatestCategories(newLatestGenres);

      } catch (err) {
        console.error('Failed to fetch recommended books:', err);
        
        // Fallback: แสดงหนังสือใหม่ล่าสุด
        const genreMap: Record<string, Book[]> = {};
        
        libraryData.forEach((book) => {
          if (!genreMap[book.genre]) {
            genreMap[book.genre] = [];
          }
          genreMap[book.genre].push(book);
        });

        const latestGenres = Object.entries(genreMap)
          .slice(0, 3)
          .map(([genre, books]) => [genre, books.slice(0, 2)] as [string, Book[]]);
        
        setRecommendedCategories(latestGenres);
        setRecommendationType('latest');

        // หนังสือใหม่อีก 3 หมวด
        const newLatestGenres = Object.entries(genreMap)
          .slice(3, 6)
          .map(([genre, books]) => [genre, books.slice(0, 2)] as [string, Book[]]);
        
        setLatestCategories(newLatestGenres);
      }
    };

    if (libraryData.length > 0) {
      fetchRecommended();
    }
  }, [libraryData]);

  const groupedGenres = useMemo(() => {
    const result: Record<string, Book[]> = {};
    libraryData.forEach((book) => {
      if (!result[book.genre]) result[book.genre] = [];
      result[book.genre].push(book);
    });
    return Object.entries(result);
  }, [libraryData]);

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

        {/* แสดงแค่ 2 เล่มในรูปแบบเดียวกับหน้าแรก */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {books.slice(0, 2).map((book) => (
            <Pressable
              key={book.id}
              onPress={() => {
                logBookView(book.id, userId);
                navigation.navigate('BookDetail', { book });
              }}
              style={styles.homeBookCardLarge}
            >
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
              onPress={() => {
                logBookView(book.id, userId);
                navigation.navigate('BookDetail', { book });
              }}
              style={[
                styles.genreBookCard,
                {
                  width: cardWidth,
                  marginRight: (index + 1) % 3 === 0 ? 0 : 8,
                  marginBottom: 12,
                },
              ]}
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
          <Image
            source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </Pressable>
      </View>

      <View style={styles.subTabContainer}>
        {(['Home', 'Categories'] as const).map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.subTab}>
            <Text style={[styles.subTabText, activeTab === tab && styles.subTabActiveText]}>
              {tab === 'Home' ? 'หน้าแรก' : 'หมวดหมู่'}
            </Text>
            {activeTab === tab && <View style={styles.subTabIndicator} />}
          </Pressable>
        ))}
      </View>

      {/* หน้าแรก: แสดงหนังสือแนะนำ 3 หมวด + หนังสือใหม่ล่าสุด 3 หมวด */}
      {activeTab === 'Home' && (
        <FlatList
          data={[
            { type: 'section', title: recommendationType === 'popular' ? '🔥 หนังสือแนะนำ' : '✨ หนังสือใหม่ล่าสุด' },
            ...recommendedCategories.map(g => ({ type: 'genre', data: g })),
            { type: 'section', title: '✨ หนังสือใหม่ล่าสุด' },
            ...latestCategories.map(g => ({ type: 'genre', data: g })),
          ]}
          keyExtractor={(item, index) => {
            if ('type' in item && item.type === 'section') {
              return `section-${index}`;
            }
            if ('type' in item && item.type === 'genre' && 'data' in item) {
              return `genre-${item.data[0]}-${index}`;
            }
            return `item-${index}`;
          }}
          renderItem={({ item }) => {
            // แสดงหัวข้อ Section
            if ('type' in item && item.type === 'section') {
              return (
                <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                    {item.title}
                  </Text>
                </View>
              );
            }
            
            // แสดงหมวดหมู่
            if ('type' in item && item.type === 'genre' && 'data' in item) {
              return renderGenre({ item: item.data as [string, Book[]] });
            }
            
            return null;
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* หน้าหมวดหมู่: แสดงหมวดหมู่ทั้งหมด */}
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

// ---------- Stack ----------
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

      <Stack.Screen
        name="GenreBooks"
        component={GenreBooksScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
      
      <Stack.Screen name="FavoriteScreen" component={FavoriteScreen} options={{ headerShown: false }} />
      
      <Stack.Screen name="HistoryScreen" options={{ headerShown: false }}>
        {(props: any) => <HistoryScreen {...props} userId={userId} userProfile={userProfile} />}
      </Stack.Screen>
      
      <Stack.Screen name="ContactScreen" component={ContactScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}