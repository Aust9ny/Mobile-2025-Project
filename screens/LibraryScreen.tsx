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

const MOCK_LIBRARY: Book[] = [
  { id: '1', title: 'มติชน', author: 'Matichon Staff', genre: 'หนังสือพิมพ์', cover: 'https://upload.wikimedia.org/wikipedia/th/5/50/Matichon_Logo.png', available: 5, borrowed: 10, total: 15 },
  { id: '2', title: 'ข่าวรายวัน', author: 'Author C', genre: 'หนังสือพิมพ์', cover: 'https://picsum.photos/200/300?random=101', available: 3, borrowed: 7, total: 10 },
  { id: '3', title: 'ไทยรัฐ', author: 'Thai Rath', genre: 'หนังสือพิมพ์', cover: 'https://picsum.photos/200/300?random=103', available: 2, borrowed: 8, total: 10 },
  { id: '4', title: 'ชีวจิต', author: 'ชีวจิตทีม', genre: 'นิตยสารสุขภาพ', cover: 'https://upload.wikimedia.org/wikipedia/th/3/36/Chivajit_magazine_cover.jpg', available: 4, borrowed: 6, total: 10 },
  { id: '5', title: 'Yoga & Health', author: 'Author E', genre: 'นิตยสารสุขภาพ', cover: 'https://picsum.photos/200/300?random=102', available: 6, borrowed: 4, total: 10 },
  { id: '6', title: 'Wellness Today', author: 'Health Team', genre: 'นิตยสารสุขภาพ', cover: 'https://picsum.photos/200/300?random=104', available: 8, borrowed: 2, total: 10 },
  { id: '7', title: 'The Silent Code', author: 'Aria Thorne', genre: 'นิยาย', cover: 'https://picsum.photos/200/300?random=1', available: 3, borrowed: 12, total: 15 },
  { id: '8', title: 'นิทานเด็ก', author: 'Author A', genre: 'นิยาย', cover: 'https://picsum.photos/200/300?random=2', available: 7, borrowed: 3, total: 10 },
  { id: '9', title: 'Magic Forest', author: 'Author B', genre: 'นิยาย', cover: 'https://picsum.photos/200/300?random=3', available: 5, borrowed: 5, total: 10 },
  { id: '10', title: 'Science World', author: 'Sci Team', genre: 'นิตยสารวิทยาศาสตร์', cover: 'https://picsum.photos/200/300?random=105', available: 4, borrowed: 6, total: 10 },
  { id: '11', title: 'Tech Today', author: 'Tech Team', genre: 'นิตยสารวิทยาศาสตร์', cover: 'https://picsum.photos/200/300?random=106', available: 6, borrowed: 4, total: 10 },
  { id: '12', title: 'Future Tech', author: 'Tech Author', genre: 'นิตยสารวิทยาศาสตร์', cover: 'https://picsum.photos/200/300?random=107', available: 9, borrowed: 1, total: 10 },
  { id: '13', title: 'Nature Wonders', author: 'Eco Writer', genre: 'สารคดีธรรมชาติ', cover: 'https://picsum.photos/200/300?random=108', available: 3, borrowed: 7, total: 10 },
  { id: '14', title: 'สัตว์โลกน่ารู้', author: 'Wildlife Group', genre: 'สารคดีธรรมชาติ', cover: 'https://picsum.photos/200/300?random=109', available: 6, borrowed: 4, total: 10 },
  { id: '15', title: 'โลกวิทยาศาสตร์', author: 'Science Thai', genre: 'นิตยสารวิทยาศาสตร์', cover: 'https://picsum.photos/200/300?random=110', available: 5, borrowed: 5, total: 10 },
  { id: '16', title: 'Digital Future', author: 'Tech Hub', genre: 'นิตยสารเทคโนโลยี', cover: 'https://picsum.photos/200/300?random=111', available: 7, borrowed: 3, total: 10 },
  { id: '17', title: 'AI Revolution', author: 'AI Team', genre: 'นิตยสารเทคโนโลยี', cover: 'https://picsum.photos/200/300?random=112', available: 4, borrowed: 6, total: 10 },
  { id: '18', title: 'ชีวิตสีเขียว', author: 'Eco Mind', genre: 'นิตยสารสุขภาพ', cover: 'https://picsum.photos/200/300?random=113', available: 8, borrowed: 2, total: 10 },
  { id: '19', title: 'Mindful Living', author: 'Zen Writer', genre: 'นิตยสารสุขภาพ', cover: 'https://picsum.photos/200/300?random=114', available: 6, borrowed: 4, total: 10 },
  { id: '20', title: 'The Hidden Truth', author: 'Mystery Pen', genre: 'นิยายสืบสวน', cover: 'https://picsum.photos/200/300?random=115', available: 2, borrowed: 8, total: 10 },
  { id: '21', title: 'Detective Mind', author: 'S. Holmes', genre: 'นิยายสืบสวน', cover: 'https://picsum.photos/200/300?random=116', available: 5, borrowed: 5, total: 10 },
  { id: '22', title: 'Quantum Realm', author: 'Dr. Q', genre: 'นิยายวิทยาศาสตร์', cover: 'https://picsum.photos/200/300?random=117', available: 4, borrowed: 6, total: 10 },
  { id: '23', title: 'Time Traveler', author: 'Future Man', genre: 'นิยายวิทยาศาสตร์', cover: 'https://picsum.photos/200/300?random=118', available: 6, borrowed: 4, total: 10 },
  { id: '24', title: 'ดาวเคราะห์ลึกลับ', author: 'Space Thai', genre: 'นิยายวิทยาศาสตร์', cover: 'https://picsum.photos/200/300?random=119', available: 8, borrowed: 2, total: 10 },
  { id: '25', title: 'Cooking Daily', author: 'Chef Dee', genre: 'นิตยสารอาหาร', cover: 'https://picsum.photos/200/300?random=120', available: 7, borrowed: 3, total: 10 },
  { id: '26', title: 'สูตรลับครัวไทย', author: 'แม่ช้อย', genre: 'นิตยสารอาหาร', cover: 'https://picsum.photos/200/300?random=121', available: 5, borrowed: 5, total: 10 },
  { id: '27', title: 'Dessert World', author: 'Chef Ploy', genre: 'นิตยสารอาหาร', cover: 'https://picsum.photos/200/300?random=122', available: 9, borrowed: 1, total: 10 },
  { id: '28', title: 'Smart Money', author: 'Finance Pro', genre: 'นิตยสารธุรกิจ', cover: 'https://picsum.photos/200/300?random=123', available: 6, borrowed: 4, total: 10 },
  { id: '29', title: 'ลงทุนง่ายๆ', author: 'Investor Thai', genre: 'นิตยสารธุรกิจ', cover: 'https://picsum.photos/200/300?random=124', available: 3, borrowed: 7, total: 10 },
  { id: '30', title: 'Business Weekly', author: 'Biz Team', genre: 'นิตยสารธุรกิจ', cover: 'https://picsum.photos/200/300?random=125', available: 8, borrowed: 2, total: 10 },
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

        {/* ------------------------------ */}
        {/* หน้าแรก (Home) */}
        {/* ------------------------------ */}
        {activeTab === 'Home' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {books.slice(0, 2).map((book) => ( // แสดง 2 เล่มแรกเฉพาะหน้าแรก
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
        )}

        {/* ------------------------------ */}
        {/* หมวดหมู่ (Categories) */}
        {/* ------------------------------ */}
        {activeTab === 'Categories' && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-start', // ✅ เปลี่ยนจาก space-between
            }}
          >
            {books.slice(0, 3).map((book, index) => (
              <Pressable
                key={book.id}
                onPress={() => navigation.navigate('BookDetail', { book })}
                style={[
                  styles.genreBookCard,
                  {
                    width: cardWidth,
                    marginRight: (index + 1) % 3 === 0 ? 0 : 8, // ✅ เว้นระยะห่าง 8px เฉพาะก่อนครบ 3 คอลัมน์
                    marginBottom: 12, // เพิ่มช่องว่างระหว่างแถว
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
