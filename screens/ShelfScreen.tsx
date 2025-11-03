import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

export default function ShelfScreen({ userProfile, isLoading = false }: any) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [borrowHistory, setBorrowHistory] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [active, setActive] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadBorrowHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('borrowHistory');
      const history = stored ? JSON.parse(stored) : [];
      setBorrowHistory(history);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(useCallback(() => {
    loadBorrowHistory();
  }, []));

  const handleReturn = async (bookId: string) => {
    const book = borrowHistory.find(b => b.id === bookId);
    if (!book) return;

    try {
      const res = await fetch(`${API_BASE}/api/books/mock/${bookId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          borrowDate: book.borrowDate,
          dueDate: book.dueDate
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('ไม่สำเร็จ', data.error || 'เกิดข้อผิดพลาด');
        return;
      }

      const stored = await AsyncStorage.getItem('borrowHistory');
      const history = stored ? JSON.parse(stored) : [];
      const updated = history.filter((b: any) => b.id !== bookId);
      await AsyncStorage.setItem('borrowHistory', JSON.stringify(updated));
      setBorrowHistory(updated);

      Alert.alert('สำเร็จ', 'คืนหนังสือเรียบร้อยแล้ว');
    } catch (e) {
      console.error(e);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  const handleExtend = async (bookId: string) => {
    const book = borrowHistory.find(b => b.id === bookId);
    if (!book) return;

    try {
      const res = await fetch(`${API_BASE}/api/books/mock/${bookId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          borrowDate: book.borrowDate,
          dueDate: book.dueDate
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('ไม่สำเร็จ', data.error || 'เกิดข้อผิดพลาด');
        return;
      }

      const newDueDate = new Date(new Date(book.dueDate).getTime() + 7 * 24 * 60 * 60 * 1000);

      const stored = await AsyncStorage.getItem('borrowHistory');
      const history = stored ? JSON.parse(stored) : [];
      const updated = history.map((b: any) =>
        b.id === bookId ? { ...b, dueDate: newDueDate.toISOString(), extended: true } : b
      );
      await AsyncStorage.setItem('borrowHistory', JSON.stringify(updated));
      setBorrowHistory(updated);

      const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
      const dueDateStr = `${newDueDate.getDate()} ${thaiMonths[newDueDate.getMonth()]} ${newDueDate.getFullYear()+543}`;

      Alert.alert('สำเร็จ', `ยืมต่อหนังสือเรียบร้อยแล้ว!\nกำหนดคืนใหม่: ${dueDateStr}`);
    } catch (e) {
      console.error(e);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  const filtered = useMemo(() => {
    if (!searchText) return borrowHistory;
    const s = searchText.toLowerCase();
    return borrowHistory.filter(
      (b) => (b.title ?? '').toLowerCase().includes(s) ||
        (b.author ?? '').toLowerCase().includes(s)
    );
  }, [borrowHistory, searchText]);

  const renderItem = ({ item }: { item: any }) => {
    const borrowDate = new Date(item.borrowDate);
    const dueDate = new Date(item.dueDate);
    const now = new Date();
    const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;

    // แก้ไข canExtend: ยืมต่อได้ถ้ายังไม่ extend และเหลือเวลา ≤ 3 วัน หรือหมดเวลาแล้ว
    const canExtend = !item.extended && (daysLeft <= 3);

    return (
      <Pressable
        onPress={() => { setActive(item); setModalVisible(true); }}
        style={{ width: cardWidth, margin: 4 }}
      >
        {item.cover ? (
          <Image source={{ uri: item.cover }} style={styles.genreBookCover} />
        ) : (
          <View style={[styles.genreBookCover, { backgroundColor:'#ccc', justifyContent:'center', alignItems:'center' }]}>
            <Text style={{ fontSize:12, color:'#666' }}>No Cover</Text>
          </View>
        )}
        <Text style={styles.genreBookTitle}>{item.title ?? ''}</Text>
        <Text style={styles.genreBookAuthor}>{item.author ?? ''}</Text>
        <Text style={{ fontSize:12, color:'gray', marginTop:2 }}>
          ยืมวันที่: {borrowDate.toLocaleDateString('th-TH')}
        </Text>
        <Text style={{ fontSize:12, color:isOverdue ? 'red' : 'green', marginTop:2, fontWeight:'600' }}>
          {isOverdue ? `⚠️ เกินกำหนดคืนแล้ว ${Math.abs(daysLeft)} วัน` : `📅 เหลือเวลาอีก ${daysLeft} วัน`}
        </Text>
        {canExtend && (
          <Text style={{ fontSize:12, color:'blue', marginTop:2 }}>
            💡 ยืมต่อได้อีก 7 วัน
          </Text>
        )}
        {item.extended && (
          <Text style={{ fontSize:11, color:'orange', marginTop:2 }}>
            ✓ ยืมต่อแล้ว
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ flex:1, backgroundColor:'#f7f7fb' }}>
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ชั้นหนังสือ</Text>
          <Pressable onPress={() => navigation.navigate('ProfileScreen' as never)}>
            <Image source={{ uri: userProfile?.photoURL ?? DEFAULT_PROFILE }} style={styles.profileImage} />
          </Pressable>
        </View>
        <SearchBar value={searchText} onChange={setSearchText} placeholder="ชื่อหนังสือ หรือชื่อผู้แต่ง" />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="small" /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>ขออภัย</Text>
          <Text style={styles.emptyText}>ท่านยังไม่มีหนังสือที่ยืม</Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor:'red' }]} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id ?? Math.random().toString()}
          renderItem={renderItem}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom:120, paddingHorizontal:4 }}
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
        canExtend={active ? (() => {
          const dueDate = new Date(active.dueDate);
          const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000*60*60*24));
          return !active.extended && (daysLeft <= 3);
        })() : false}
      />
    </View>
  );
}
