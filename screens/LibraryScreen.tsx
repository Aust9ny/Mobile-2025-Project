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

// ---------- หน้าแสดงหนังสือทั้งหมดของ genre ----------
// ---------- หน้าแสดงหนังสือทั้งหมดของ genre ----------
function GenreBooksScreen({ route, navigation }: any) {
  // 🎯 รับ onBorrowSuccess จาก route.params
  const { genre, books, onBorrowSuccess } = route.params; 

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
            onPress={() => navigation.navigate('BookDetail', { 
              book: item,
              // 🎯 แนบ onBorrowSuccess เข้าไปเมื่อนำทาง
              onBorrowSuccess: onBorrowSuccess // <--- ส่งต่อ Callback
            })}
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
// 🎯 แก้ไข: รับ refreshShelf เข้ามาใน Props
function LibraryHome({ shelfBooks, userProfile, refreshShelf }: Props & { refreshShelf: () => void }) {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'Home' | 'Categories'>('Home');

  // ... (libraryData, groupedGenres - unchanged) ...
  const libraryData: Book[] = useMemo(() => {
    // ... logic ...
    return MOCK_LIBRARY;
  }, [shelfBooks]);

  const groupedGenres = useMemo(() => {
    // ... logic ...
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
            // 🎯 แนบ Callback เข้าไปเมื่อนำทางไปหน้าดูทั้งหมด
            onPress={() => navigation.navigate('GenreBooks', { genre, books, onBorrowSuccess: refreshShelf })}
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
            {books.slice(0, 2).map((book) => (
              <Pressable
                key={book.id}
                onPress={() => navigation.navigate('BookDetail', { 
                  book,
                  // 🎯 แนบ Callback เข้าไปเมื่อนำทางจากหน้า Home
                  onBorrowSuccess: refreshShelf 
                })}
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
              justifyContent: 'flex-start',
            }}
          >
            {books.slice(0, 3).map((book, index) => (
              <Pressable
                key={book.id}
                onPress={() => navigation.navigate('BookDetail', { 
                  book,
                  // 🎯 แนบ Callback เข้าไปเมื่อนำทางจากหน้า Categories
                  onBorrowSuccess: refreshShelf 
                })}
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
  
  // ... (Header and Tabs - unchanged) ...
  return (
    
    <View style={{ flex: 1 }}>
        {/* Header and Sub Tabs */}
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
        {/* ... */}
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
// 🎯 แก้ไข: รับ props ที่มี refreshShelf เข้ามา
export default function LibraryScreenStack(props: { userId: string, shelfBooks: Props['shelfBooks'], userProfile: Props['userProfile'], refreshShelf: () => void }) {
  const { shelfBooks, userProfile, refreshShelf } = props;
  
  return (
    <Stack.Navigator>
      <Stack.Screen name="LibraryHome" options={{ headerShown: false }}>
        {/* 🎯 ส่ง props ทั้งหมดที่ต้องการลงไป รวมถึง refreshShelf */}
        {() => (
            <LibraryHome 
                shelfBooks={shelfBooks} 
                userProfile={userProfile} 
                refreshShelf={refreshShelf} // <--- ส่งฟังก์ชัน Refetch ต่อลงไป
            />
        )}
      </Stack.Screen>

      {/* 🎯 สำคัญ: การแนบ Callback เข้าไปใน params ของ BookDetail */}
      <Stack.Screen
        name="BookDetail"
        options={{
          title: 'รายละเอียดหนังสือ',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#115566' },
        }}
      >
        {(navProps) => (
            <BookDetailScreen 
                {...navProps} 
                // 🎯 แนบ Callback จาก Parent (refreshShelf) เข้าไปใน route.params
                onBorrowSuccess={refreshShelf} 
            />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="GenreBooks"
        component={GenreBooksScreen}
        options={{ headerShown: false }}
      />

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
