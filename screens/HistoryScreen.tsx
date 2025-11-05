import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/HistoryScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png';
import NoIcon from '../assets/healthicons_no.png';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const screenWidth = Dimensions.get('window').width;

// 🔹 กำหนด base URL สำหรับ backend
const BACKEND_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BACKEND_URL = `http://${BACKEND_HOST}:4000`;

type HistoryItem = {
  bookId: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover: string;
    genre: string;
  };
  viewedAt: string;
  viewCount: number;
};

export default function HistoryScreen({ 
  userId, 
  userProfile 
}: { 
  userId?: string | null;
  userProfile?: { photoURL?: string };
}) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  // 🔹 ฟังก์ชันดึง temp userId (เหมือนใน LibraryScreen)
  const getTempUserId = async () => {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      let tempUserId = await AsyncStorage.getItem('temp_user_id');
      
      if (!tempUserId) {
        tempUserId = `temp_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('temp_user_id', tempUserId);
      }
      
      return tempUserId;
    } catch (error) {
      return `guest_${Date.now()}`;
    }
  };

  // 🔹 ดึงประวัติจาก backend
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      
      // ถ้าไม่มี userId ให้ใช้ temp userId
      const effectiveUserId = userId || await getTempUserId();

      try {
        const response = await fetch(`${BACKEND_URL}/api/books/mock/history/${effectiveUserId}`);
        
        if (!response.ok) {
          console.error('Failed to fetch history:', response.status);
          setHistory([]);
          return;
        }

        const data = await response.json();
        console.log('📜 History loaded for', effectiveUserId, ':', data.totalItems, 'items');
        setHistory(data.history || []);
      } catch (error) {
        console.error('❌ Error loading history:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation, userId]);

  // 🔹 ค้นหาตามชื่อหนังสือหรือผู้แต่ง
  const filteredHistory = history.filter((item) =>
    item.book.title.toLowerCase().includes(searchText.toLowerCase()) ||
    item.book.author.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderGridItem = ({ item, index }: { item: HistoryItem; index: number }) => {
    // คำนวณขนาดให้เท่ากันเสมอ (3 คอลัมน์)
    const itemWidth = (screenWidth - 32) / 3; // 32 = padding ซ้าย-ขวา
    const itemMarginRight = (index + 1) % 3 === 0 ? 0 : 8;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { 
            width: itemWidth,
            marginRight: itemMarginRight,
          },
        ]}
        onPress={() => navigation.navigate('BookDetail', { book: item.book })}
      >
        <Image 
          source={{ uri: item.book.cover }} 
          style={[
            styles.cover, 
            { 
              width: '100%',
              height: itemWidth * 1.4,
            }
          ]} 
          resizeMode="cover"
        />
        <Text style={styles.title} numberOfLines={2}>
          {item.book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {item.book.author}
        </Text>
        
        {/* แสดงเวลาดูล่าสุด */}
        <Text style={styles.status} numberOfLines={1}>
          {new Date(item.viewedAt).toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        
        {/* แสดงจำนวนครั้งที่ดู (ถ้าต้องการ) */}
        {item.viewCount > 1 && (
          <Text style={{ fontSize: 10, color: '#888', textAlign: 'center', marginTop: 2 }}>
            ดู {item.viewCount} ครั้ง
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
      {/* Header */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ประวัติการเข้าชม</Text>

          {/* กดไปหน้า ProfileScreen */}
          <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
            <Image
              source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
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

      {/* Loading Indicator */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#115566" />
          <Text style={{ marginTop: 16, color: '#666' }}>กำลังโหลดประวัติ...</Text>
        </View>
      ) : filteredHistory.length > 0 ? (
        /* Grid Books */
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => `${item.bookId}-${item.viewedAt}`}
          numColumns={3}
          renderItem={renderGridItem}
          columnWrapperStyle={{ paddingHorizontal: 8 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        />
      ) : (
        /* Empty State */
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