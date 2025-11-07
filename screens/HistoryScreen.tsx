// ---------------------- HistoryScreen.tsx (MySQL backend) ----------------------
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 🛠️ Import AsyncStorage ที่ด้านบน
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // 🛠️ Import NavigationProp
import { styles } from '../styles/HistoryScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png';
import NoIcon from '../assets/healthicons_no.png';

// 📚 กำหนด Type สำหรับ Navigation (ตัวอย่าง)
type RootStackParamList = {
  HistoryScreen: { userId?: string | null; userProfile?: { photoURL?: string } };
  BookDetail: { book: HistoryItem['book'] };
  ProfileScreen: undefined;
};

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const screenWidth = Dimensions.get('window').width;

// 🔹 ปรับ API URL ให้เหมาะกับ platform
const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${API_HOST}:4000`;

type BookDetails = {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre?: string;
};

type HistoryItem = {
  bookId: string; // ID ของหนังสือ
  book: BookDetails;
  viewedAt: string; // เวลาที่เข้าชม
  viewCount: number;
};

// 🛡️ Type สำหรับข้อมูลที่คาดว่าจะได้รับจาก Backend
type BackendHistoryItem = {
  id?: string | number; // ID ของหนังสือ (กรณี join)
  book_id?: string | number; // ID ของหนังสือ (กรณีเก็บแยก)
  title: string;
  author: string;
  cover: string;
  genre?: string;
  view_time: string; // เวลาที่เข้าชมจาก MySQL
};

// 🔹 ฟังก์ชันดึง temp userId (ปรับปรุงให้ใช้ Async Storage ที่ Import ด้านบน)
const getTempUserId = async () => {
  try {
    let tempUserId = await AsyncStorage.getItem('temp_user_id');
    if (!tempUserId) {
      // สร้าง ID ชั่วคราวที่ไม่ซ้ำกัน
      tempUserId = `temp_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('temp_user_id', tempUserId);
    }
    return tempUserId;
  } catch (err) {
    console.warn('Failed to get temp userId, fallback to guest:', err);
    return `guest_${Date.now()}`;
  }
};

export default function HistoryScreen({
  userId,
  userProfile
}: {
  userId?: string | null;
  userProfile?: { photoURL?: string };
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // 🛠️ ใช้ Type ที่กำหนด
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 ดึงประวัติจาก backend (MySQL)
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError(null);

      // 📚 กำหนด userId ที่จะใช้ (เข้าสู่ระบบ vs แขก)
      const effectiveUserId = userId || await getTempUserId();
      console.log('🔹 Using effectiveUserId:', effectiveUserId);

      try {
        const response = await fetch(`${API_URL}/api/users/${effectiveUserId}/history`);
        if (!response.ok) {
          const msg = `Failed to fetch history, status: ${response.status}`;
          console.error('❌', msg);
          setError('ไม่สามารถโหลดประวัติได้');
          setHistory([]);
          return;
        }

        const responseData = await response.json();
        console.log('📜 Fetched data:', responseData);

        // ตรวจสอบโครงสร้างข้อมูล
        if (!responseData || !Array.isArray(responseData.history)) {
          const msg = 'Invalid data structure received from server';
          console.warn('⚠️', msg);
          setError(msg);
          setHistory([]);
          return;
        }

        // 🔹 Map response ให้ตรงกับ frontend HistoryItem
        const mappedHistory: HistoryItem[] = responseData.history.map((h: BackendHistoryItem) => {
          // ใช้ book_id เป็นตัวหลัก หากไม่มีใช้ id จากการ join
          const bookIdentifier = (h.book_id || h.id)?.toString() || `unknown-${Math.random()}`;

          return {
            bookId: bookIdentifier,
            book: {
              id: bookIdentifier,
              title: h.title || 'No Title',
              author: h.author || 'No Author',
              cover: h.cover || 'https://via.placeholder.com/150x200/386156/FFFFFF?text=No+Cover',
              genre: h.genre,
            },
            viewedAt: h.view_time || new Date().toISOString(),
            viewCount: 1, // ปล่อยเป็น 1 จนกว่า backend จะเก็บ count ต่อ user
          };
        });

        setHistory(mappedHistory);
      } catch (err) {
        console.error('❌ Error loading history:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    // 🔄 โหลดข้อมูลทุกครั้งที่หน้าจอถูกโฟกัส
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation, userId]);

  // 🔹 ค้นหาตามชื่อหนังสือหรือผู้แต่ง
  const filteredHistory = history.filter((item) => {
    const title = item.book?.title?.toLowerCase() || '';
    const author = item.book?.author?.toLowerCase() || '';
    const searchTextLower = searchText.toLowerCase();
    return title.includes(searchTextLower) || author.includes(searchTextLower);
  });

  const renderGridItem = ({ item, index }: { item: HistoryItem; index: number }) => {
    const itemWidth = (screenWidth - 32) / 3;
    const itemMarginRight = (index + 1) % 3 === 0 ? 0 : 8;

    // 📅 จัดรูปแบบวันที่/เวลาให้กระชับ
    const formatViewDate = (isoString: string) => {
      try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const datePart = date.toLocaleDateString('th-TH', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const timePart = date.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `${datePart} ${timePart}`;
      } catch {
        return 'No Date';
      }
    };

    return (
      <TouchableOpacity
        style={[styles.card, { width: itemWidth, marginRight: itemMarginRight }]}
        onPress={() => navigation.navigate('BookDetail', { book: item.book })}
      >
        <Image 
          source={{ uri: item.book.cover || DEFAULT_PROFILE }} 
          style={[styles.cover, { width: '100%', height: itemWidth * 1.4 }]} 
          resizeMode="cover"
        />
        <Text style={styles.title} numberOfLines={2}>
          {item.book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {item.book.author}
        </Text>
        <Text style={styles.status} numberOfLines={1}>
          {item.viewedAt ? formatViewDate(item.viewedAt) : 'No Date'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
      <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ประวัติการเข้าชม</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
            <Image
              source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Image source={SearchIcon} style={styles.searchIcon} resizeMode="contain" />
          <TextInput
            style={styles.input}
            placeholder="ชื่อหนังสือ หรือชื่อผู้แต่ง"
            placeholderTextColor="#386156"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#115566" />
          <Text style={{ marginTop: 16, color: '#666' }}>กำลังโหลดประวัติ...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
        </View>
      ) : filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          // 🛠️ ใช้ bookId ร่วมกับ viewedAt เป็น Key เพื่อให้ Key ไม่ซ้ำแม้จะเข้าชมหนังสือเล่มเดิมหลายครั้ง
          keyExtractor={(item) => `${item.bookId}-${item.viewedAt}`}
          numColumns={3}
          renderItem={renderGridItem}
          columnWrapperStyle={{ paddingHorizontal: 8 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {searchText
              ? 'ไม่พบหนังสือที่ค้นหา'
              : 'ท่านยังไม่มีประวัติการเข้าชม'}
          </Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
        </View>
      )}
    </View>
  );
}