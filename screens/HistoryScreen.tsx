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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from '../styles/HistoryScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png';
import NoIcon from '../assets/healthicons_no.png';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const screenWidth = Dimensions.get('window').width;

const getBackendHost = () =>
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

const getTempUserId = async () => {
  try {
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

export default function HistoryScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ โหลดประวัติการดูหนังสือจาก database
  const loadHistory = async () => {
    try {
      setLoading(true);
      const userId = await getTempUserId();
      const backend = getBackendHost();
      
      const res = await fetch(`${backend}/api/books/mock/history/${userId}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await res.json();
      
      // แปลงข้อมูลให้เข้ากับ format เดิม
      const formattedHistory = (data.history || []).map((item: any) => ({
        id: item.book?.id || item.bookId,
        title: item.book?.title || '',
        author: item.book?.author || '',
        cover: item.book?.cover || DEFAULT_PROFILE,
        genre: item.book?.genre || '',
        viewedAt: item.viewedAt,
        viewCount: item.viewCount || 1,
      }));
      
      setHistory(formattedHistory);
      
      console.log(`✅ [HistoryScreen] โหลด ${formattedHistory.length} รายการประวัติ`);
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ โหลดใหม่ทุกครั้งที่เข้าหน้านี้
  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [])
  );

  // ✅ Filter ตาม searchText
  const filteredHistory = history.filter((item) =>
    item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.author?.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderGridItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { width: screenWidth / 3 - 20, marginRight: (index + 1) % 3 === 0 ? 0 : 8 },
      ]}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Image source={{ uri: item.cover }} style={styles.cover} />
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {item.author}
      </Text>
      <Text style={styles.status} numberOfLines={1}>
        {item.viewedAt
          ? new Date(item.viewedAt).toLocaleString('th-TH', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : ''}
      </Text>
      {item.viewCount > 1 && (
        <Text style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
          ดู {item.viewCount} ครั้ง
        </Text>
      )}
    </TouchableOpacity>
  );

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

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#115566" />
          <Text style={{ marginTop: 10, color: '#666' }}>กำลังโหลด...</Text>
        </View>
      ) : filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => `${item.id}-${item.viewedAt}`}
          numColumns={3}
          renderItem={renderGridItem}
          columnWrapperStyle={{ paddingHorizontal: 8, marginTop: 16 }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {searchText ? 'ไม่พบหนังสือที่ค้นหา' : 'ท่านยังไม่มีประวัติการเข้าชม'}
          </Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
        </View>
      )}
    </View>
  );
}