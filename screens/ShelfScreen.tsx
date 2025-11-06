import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BookInteractionModal from '../components/BookInteractionModal';
import SearchBar from '../components/SearchBar';
import NoIcon from '../assets/healthicons_no.png';
import styles, { cardWidth } from '../styles/ShelfScreenStyle';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

const getTempUserId = async () => {
  try {
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

export default function ShelfScreen({ userProfile, isLoading = false }: any) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [borrowHistory, setBorrowHistory] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [active, setActive] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ โหลดประวัติการยืมจาก database
  const loadBorrowHistory = async () => {
    try {
      setLoading(true);
      const userId = await getTempUserId();

      // ⭐️ เรียก API เพื่อดึงข้อมูลการยืมจาก database
      const response = await fetch(`${API_BASE}/api/borrows/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch borrow history');
      }

      const data = await response.json();
      setBorrowHistory(data.borrows || []);
    } catch (error) {
      console.error('Error loading borrow history:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดประวัติการยืมได้');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBorrowHistory();
    }, [])
  );

  // ✅ คืนหนังสือ
  const handleReturn = async (bookId: string) => {
    try {
      const userId = await getTempUserId();

      const response = await fetch(`${API_BASE}/api/borrows/mock/${bookId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('ไม่สำเร็จ', data.error || 'เกิดข้อผิดพลาด');
        return;
      }

      // โหลดข้อมูลใหม่
      await loadBorrowHistory();

      Alert.alert('สำเร็จ', 'คืนหนังสือเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error returning book:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถคืนหนังสือได้');
    }
  };

  // ✅ ยืมต่อ
  const handleExtend = async (bookId: string) => {
    try {
      const userId = await getTempUserId();

      const response = await fetch(`${API_BASE}/api/borrows/mock/${bookId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('ไม่สำเร็จ', data.error || 'เกิดข้อผิดพลาด');
        return;
      }

      // โหลดข้อมูลใหม่
      await loadBorrowHistory();

      const newDueDate = new Date(data.newDueDate);
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const dueDateStr = `${newDueDate.getDate()} ${thaiMonths[newDueDate.getMonth()]} ${newDueDate.getFullYear() + 543}`;

      Alert.alert('สำเร็จ', `ยืมต่อหนังสือเรียบร้อยแล้ว!\nกำหนดคืนใหม่: ${dueDateStr}`);
    } catch (error) {
      console.error('Error extending borrow:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถยืมต่อได้');
    }
  };

  const filtered = useMemo(() => {
    if (!searchText) return borrowHistory;
    const s = searchText.toLowerCase();
    return borrowHistory.filter(
      (b) =>
        (b.title ?? '').toLowerCase().includes(s) ||
        (b.author ?? '').toLowerCase().includes(s)
    );
  }, [borrowHistory, searchText]);

  const renderItem = ({ item }: { item: any }) => {
    const borrowDate = new Date(item.borrow_date);
    const dueDate = new Date(item.due_date);
    const now = new Date();
    const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;
    const canExtend = !item.extended && daysLeft <= 3;

    return (
      <Pressable
        onPress={() => {
          setActive(item);
          setModalVisible(true);
        }}
        style={{ width: cardWidth, margin: 4 }}
      >
        {item.cover ? (
          <Image source={{ uri: item.cover }} style={styles.genreBookCover} />
        ) : (
          <View
            style={[
              styles.genreBookCover,
              { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            <Text style={{ fontSize: 12, color: '#666' }}>No Cover</Text>
          </View>
        )}
        <Text style={styles.genreBookTitle}>{item.title ?? ''}</Text>
        <Text style={styles.genreBookAuthor}>{item.author ?? ''}</Text>
        <Text style={{ fontSize: 12, color: 'gray', marginTop: 2 }}>
          ยืมวันที่: {borrowDate.toLocaleDateString('th-TH')}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: isOverdue ? 'red' : 'green',
            marginTop: 2,
            fontWeight: '600',
          }}
        >
          {isOverdue
            ? `⚠️ เกินกำหนดคืนแล้ว ${Math.abs(daysLeft)} วัน`
            : `📅 เหลือเวลาอีก ${daysLeft} วัน`}
        </Text>
        {canExtend && (
          <Text style={{ fontSize: 12, color: 'blue', marginTop: 2 }}>
            💡 ยืมต่อได้อีก 7 วัน
          </Text>
        )}
        {item.extended && (
          <Text style={{ fontSize: 11, color: 'orange', marginTop: 2 }}>
            ✓ ยืมต่อแล้ว
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7fb' }}>
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ชั้นหนังสือ</Text>
          <Pressable onPress={() => navigation.navigate('ProfileScreen' as never)}>
            <Image
              source={{ uri: userProfile?.photoURL ?? DEFAULT_PROFILE }}
              style={styles.profileImage}
            />
          </Pressable>
        </View>
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="ชื่อหนังสือ หรือชื่อผู้แต่ง"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#115566" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>ขออภัย</Text>
          <Text style={styles.emptyText}>ท่านยังไม่มีหนังสือที่ยืม</Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id?.toString() ?? Math.random().toString()}
          renderItem={renderItem}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 4 }}
        />
      )}

      <BookInteractionModal
        visible={modalVisible}
        book={active}
        onClose={() => setModalVisible(false)}
        onReturn={async (id: string) => {
          await handleReturn(id);
          setModalVisible(false);
        }}
        onExtend={async (id: string) => {
          await handleExtend(id);
          setModalVisible(false);
        }}
        canExtend={
          active
            ? (() => {
                const dueDate = new Date(active.due_date);
                const daysLeft = Math.ceil(
                  (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return !active.extended && daysLeft <= 3;
              })()
            : false
        }
      />
    </View>
  );
}