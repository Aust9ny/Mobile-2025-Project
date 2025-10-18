import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, Image, ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import BookDetailScreen from './BookDetailScreen';
import SearchScreen from './SearchScreen';
import { styles } from '../styles/LibraryScreenStyle';

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  summary: string;
  releaseDate: string;
  cover: string;
};

type Props = {
  userId: string | null;
  shelfBooks: Book[];
  userProfile?: { photoURL?: string };
};

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const MOCK_LIBRARY: Book[] = [
  // ----- หนังสือพิมพ์ -----
  { id: '1', title: 'มติชน', author: 'Matichon Staff', genre: 'หนังสือพิมพ์', summary: '', releaseDate: '', cover: 'https://upload.wikimedia.org/wikipedia/th/5/50/Matichon_Logo.png' },
  { id: '2', title: 'ข่าวรายวัน', author: 'Author C', genre: 'หนังสือพิมพ์', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=101' },

  // ----- นิตยสารสุขภาพ -----
  { id: '3', title: 'ชีวจิต', author: 'ชีวจิตทีม', genre: 'นิตยสารสุขภาพ', summary: '', releaseDate: '', cover: 'https://upload.wikimedia.org/wikipedia/th/3/36/Chivajit_magazine_cover.jpg' },
  { id: '4', title: 'Yoga & Health', author: 'Author E', genre: 'นิตยสารสุขภาพ', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=102' },

  // ----- นิยาย (มีหนังสือเยอะ) -----
  { id: '5', title: 'The Silent Code', author: 'Aria Thorne', genre: 'นิยาย', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=1' },
  { id: '6', title: 'นิทานเด็ก', author: 'Author A', genre: 'นิยาย', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=2' },
  { id: '7', title: 'Mystery Night', author: 'Author D', genre: 'นิยาย', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=3' },
  { id: '8', title: 'Fantasy World', author: 'Author G', genre: 'นิยาย', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=4' },
  { id: '9', title: 'Romance Story', author: 'Author H', genre: 'นิยาย', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=5' },
  { id: '10', title: 'Sci-Fi Adventure', author: 'Author I', genre: 'นิยาย', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=6' },
  { id: '11', title: 'Horror Tales', author: 'Author J', genre: 'นิยาย', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=7' },
  { id: '12', title: 'Comedy Life', author: 'Author K', genre: 'นิยาย', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=8' },
  { id: '13', title: 'Thriller Night', author: 'Author L', genre: 'นิยาย', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=9' },
  { id: '14', title: 'Adventure Quest', author: 'Author M', genre: 'นิยาย', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=10' },

  // ----- วิทยาศาสตร์ (genre ใหม่) -----
  { id: '15', title: 'Physics 101', author: 'Dr. Albert', genre: 'วิทยาศาสตร์', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=201' },
  { id: '16', title: 'Chemistry Basics', author: 'Dr. Marie', genre: 'วิทยาศาสตร์', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=202' },
  { id: '17', title: 'Biology for Kids', author: 'Dr. Darwin', genre: 'วิทยาศาสตร์', summary: '', releaseDate: '', cover: 'https://picsum.photos/200/300?random=203' },
];


const Stack = createNativeStackNavigator();

// ---------- หน้าแสดงหนังสือทั้งหมดของ genre ----------
function GenreBooksScreen({ route, navigation }: any) {
  const { genre, books } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      {/* 🔙 ปุ่มย้อนกลับ */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.backButtonContainer}
      >
        <Text style={styles.backButtonArrow}>{'<'}</Text>
        <Text style={styles.backButtonText}>ย้อนกลับ</Text>
      </Pressable>


      {/* 🔹 รายการหนังสือในหมวดหมู่ */}
      <FlatList
        data={books}
        keyExtractor={(b: Book) => b.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('BookDetail', { book: item })}
            style={styles.genreBookCard}
          >
            <Image
              source={{ uri: item.cover }}
              style={styles.genreBookCover}
              resizeMode="cover"
            />
            <View style={styles.genreBookInfo}>
              <Text style={styles.genreBookTitle}>{item.title}</Text>
              <Text style={styles.genreBookAuthor}>{item.author}</Text>
            </View>
          </Pressable>
        )}
      />

    </View>
  );
}

// ---------- หน้าหลัก ----------
function LibraryHome({ shelfBooks, userProfile }: Props) {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'Home' | 'Categories'>('Home');

  const libraryData: Book[] =
    Array.isArray(shelfBooks) && shelfBooks.length > 0 ? shelfBooks : MOCK_LIBRARY;

  const groupedGenres = useMemo(() => {
    const result: Record<string, Book[]> = {};
    libraryData.forEach((book) => {
      if (!result[book.genre]) result[book.genre] = [];
      result[book.genre].push(book);
    });
    return Object.entries(result);
  }, [libraryData]);

  const renderGenre = (genre: string, books: Book[], showSeeAll: boolean) => (
    <View key={genre} style={styles.genreSection}>
      {/* 🔹 ชื่อหมวดหมู่และ “ดูทั้งหมด >” */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginHorizontal: 16,
          marginBottom: 6,
        }}
      >
        <Text style={{ color: '#115566', fontSize: 20, fontWeight: '700' }}>{genre}</Text>
        {showSeeAll && (
          <Pressable
            onPress={() => navigation.navigate('GenreBooks', { genre, books })}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={{ color: '#B0BA1D', fontWeight: '600', fontSize: 16 }}>
              ดูทั้งหมด
            </Text>
            <Text style={{ color: '#B0BA1D', fontWeight: '600', marginLeft: 3 }}>{'>'}</Text>
          </Pressable>
        )}
      </View>

      {/* 🔸 รายการหนังสือในแนวนอน */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={books}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('BookDetail', { book: item })}
            style={styles.bookCard}
          >
            <Image source={{ uri: item.cover }} style={styles.cover} />
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 Header */}
      <View style={styles.customHeader}>
        <Text style={styles.headerTitle}>ห้องสมุด</Text>

        {userProfile && userProfile.photoURL ? (
          <Image
            source={{ uri: userProfile.photoURL }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={{ uri: DEFAULT_PROFILE }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        )}
      </View>

      {/* 🔹 Tabs (หน้าแรก / หมวดหมู่) */}
      <View style={styles.subTabContainer}>
        {(['Home', 'Categories'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.subTab}
          >
            <Text
              style={[
                styles.subTabText,
                activeTab === tab && styles.subTabActiveText,
              ]}
            >
              {tab === 'Home' ? 'หน้าแรก' : 'หมวดหมู่'}
            </Text>
            {activeTab === tab && <View style={styles.subTabIndicator} />}
          </Pressable>
        ))}
      </View>

      {/* 🔹 เนื้อหา */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {groupedGenres.map(([genre, books]) =>
          renderGenre(genre, books, activeTab === 'Categories')
        )}
      </ScrollView>
    </View>
  );
}

// ---------- Stack หลัก ----------
export default function LibraryScreenStack({ userId, shelfBooks, userProfile }: Props) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LibraryHome" options={{ headerShown: false }}>
        {(props: any) => (
          <LibraryHome {...props} shelfBooks={shelfBooks} userProfile={userProfile} />
        )}
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

      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
