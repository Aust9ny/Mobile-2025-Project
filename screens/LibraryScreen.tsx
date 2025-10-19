import React, { useState, useMemo } from 'react';
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

const MOCK_LIBRARY: Book[] = [
  { id: '1', title: 'มติชน', author: 'Matichon Staff', genre: 'หนังสือพิมพ์', cover: 'https://upload.wikimedia.org/wikipedia/th/5/50/Matichon_Logo.png' },
  { id: '2', title: 'ข่าวรายวัน', author: 'Author C', genre: 'หนังสือพิมพ์', cover: 'https://picsum.photos/200/300?random=101' },
  { id: '3', title: 'ไทยรัฐ', author: 'Thai Rath', genre: 'หนังสือพิมพ์', cover: 'https://picsum.photos/200/300?random=103' },
  { id: '4', title: 'ชีวจิต', author: 'ชีวจิตทีม', genre: 'นิตยสารสุขภาพ', cover: 'https://upload.wikimedia.org/wikipedia/th/3/36/Chivajit_magazine_cover.jpg' },
  { id: '5', title: 'Yoga & Health', author: 'Author E', genre: 'นิตยสารสุขภาพ', cover: 'https://picsum.photos/200/300?random=102' },
  { id: '6', title: 'Wellness Today', author: 'Health Team', genre: 'นิตยสารสุขภาพ', cover: 'https://picsum.photos/200/300?random=104' },
  { id: '7', title: 'The Silent Code', author: 'Aria Thorne', genre: 'นิยาย', cover: 'https://picsum.photos/200/300?random=1' },
  { id: '8', title: 'นิทานเด็ก', author: 'Author A', genre: 'นิยาย', cover: 'https://picsum.photos/200/300?random=2' },
  { id: '9', title: 'Magic Forest', author: 'Author B', genre: 'นิยาย', cover: 'https://picsum.photos/200/300?random=3' },
  { id: '10', title: 'Science World', author: 'Sci Team', genre: 'นิตยสารวิทยาศาสตร์', cover: 'https://picsum.photos/200/300?random=105' },
  { id: '11', title: 'Tech Today', author: 'Tech Team', genre: 'นิตยสารวิทยาศาสตร์', cover: 'https://picsum.photos/200/300?random=106' },
  { id: '12', title: 'Future Tech', author: 'Tech Author', genre: 'นิตยสารวิทยาศาสตร์', cover: 'https://picsum.photos/200/300?random=107' },
];

const Stack = createNativeStackNavigator();

// ---------- หน้าแสดงหนังสือทั้งหมดของ genre ----------
function GenreBooksScreen({ route, navigation }: any) {
  const { genre, books } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      {/* Back Button */}
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
            onPress={() => navigation.navigate('BookDetail', { book: item })}
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

// ---------- หน้าหลัก Library ----------
function LibraryHome({ shelfBooks, userProfile }: Props) {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'Home' | 'Categories'>('Home');

  const libraryData: Book[] = shelfBooks && shelfBooks.length ? shelfBooks : MOCK_LIBRARY;

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

        {activeTab === 'Home' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {books.slice(0, 2).map((book) => ( // เลือกแค่ 2 เล่มแรก
              <Pressable
                key={book.id}
                onPress={() => navigation.navigate('BookDetail', { book })}
                style={styles.homeBookCardLarge}
              >
                <Text style={styles.homeBookTitleLarge}>{book.title}</Text>
                <Image
                  source={{ uri: book.cover }}
                  style={styles.homeBookCoverLarge}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {books.map((book) => (
              <Pressable
                key={book.id}
                onPress={() => navigation.navigate('BookDetail', { book })}
                style={[styles.genreBookCard, { width: cardWidth }]}
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
      {/* Header */}
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

      {/* Sub Tabs */}
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
