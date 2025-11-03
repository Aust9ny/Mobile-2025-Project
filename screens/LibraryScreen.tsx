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

function GenreBooksScreen({ route, navigation }: any) {
  const { genre, books } = route.params;

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
              // log view ไป backend
              fetch(`${BACKEND_URL}/api/books/mock/${item.id}/view`, { method: 'POST' })
                .catch(err => console.error('Log view failed:', err));

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

function LibraryHome({ shelfBooks, userProfile }: Props) {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'Home' | 'Categories'>('Home');
  const [libraryData, setLibraryData] = useState<Book[]>([]);

  // 🔹 ดึงข้อมูลหนังสือจาก backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/books/mock/all`)
      .then(res => res.json())
      .then(data => setLibraryData(data.books))
      .catch(err => console.error('Fetch books failed:', err));
  }, []);

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
            onPress={() => navigation.navigate('GenreBooks', { genre, books })}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
            <Text style={styles.seeAllText}>{' >'}</Text>
          </Pressable>
        </View>

        {activeTab === 'Home' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {books.slice(0, 2).map((book) => (
              <Pressable
                key={book.id}
                onPress={() => {
                  fetch(`${BACKEND_URL}/api/books/mock/${book.id}/view`, { method: 'POST' })
                    .catch(err => console.error('Log view failed:', err));

                  navigation.navigate('BookDetail', { book });
                }}
                style={styles.homeBookCardLarge}
              >
                <Text style={styles.homeBookTitleLarge}>{book.title}</Text>
                <Image source={{ uri: book.cover }} style={styles.homeBookCoverLarge} resizeMode="cover" />
              </Pressable>
            ))}
          </View>
        )}

        {activeTab === 'Categories' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {books.slice(0, 3).map((book, index) => (
              <Pressable
                key={book.id}
                onPress={() => {
                  fetch(`${BACKEND_URL}/api/books/mock/${book.id}/view`, { method: 'POST' })
                    .catch(err => console.error('Log view failed:', err));

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
        )}
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

      <FlatList
        data={groupedGenres}
        keyExtractor={([genre]) => genre}
        renderItem={renderGenre}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ---------- Stack ----------
export default function LibraryScreenStack({ userId, shelfBooks, userProfile }: Props) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LibraryHome" options={{ headerShown: false }}>
        {(props: any) => <LibraryHome {...props} shelfBooks={shelfBooks} userProfile={userProfile} />}
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
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ContactScreen" component={ContactScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
