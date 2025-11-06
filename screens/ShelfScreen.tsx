import React, { useMemo, useState, useEffect } from 'react'; // 👈 1. Import useEffect
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // 👈 2. ลบ useFocusEffect
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Import ไฟล์ใหม่ ---
import BookInteractionModal from '../components/BookInteractionModal';
import SearchBar from '../components/SearchBar';
import ShelfBookCard from '../components/BookCard'; // 👈 3. Import Card ใหม่
import { returnBook, extendBook } from '../services/BorrowService'; // 👈 4. Import Service
import { canExtend } from '../utils/BookHelper'; // 👈 5. Import Helper
// ---

import NoIcon from '../assets/healthicons_no.png';
import styles, { cardWidth } from '../styles/ShelfScreenStyle';

type Props = {
  userProfile?: { photoURL?: string };
  isLoading?: boolean;
  shelfBooks?: any[];
  userToken?: string | null;
  onRefresh?: () => void;
};

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function ShelfScreen({ userProfile, isLoading = false, shelfBooks = [], userToken, onRefresh }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [list, setList] = useState<any[]>(shelfBooks); // 👈 6. Sync state ด้วย useEffect
  const [searchText, setSearchText] = useState('');
  const [active, setActive] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 👈 7. ใช้ useEffect ในการ Sync state เมื่อ prop เปลี่ยน
  useEffect(() => {
    setList(shelfBooks);
  }, [shelfBooks]);

  // 👈 8. Logic คืนหนังสือ (เรียก Service)
  const handleReturn = async (id: string) => {
    try {
      await returnBook(id, userToken!); // เรียกใช้ Service
      Alert.alert('สำเร็จ', 'คืนหนังสือเรียบร้อยแล้ว');
      setModalVisible(false);
      onRefresh?.();
    } catch (e: any) {
      console.error('Return failed:', e);
      Alert.alert('ผิดพลาด', e.message || 'คืนหนังสือไม่สำเร็จ');
    }
  };

  // 👈 9. Logic ยืมต่อ (เรียก Service)
  // ฟังก์ชันเช็คว่ายืมต่อได้หรือไม่
  const canExtend = (book: any) => {
    const dueDate = new Date(book.dueDate);
    const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && !book.extended;
  };

  // คืนหนังสือ
  const handleReturn = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/borrows/${id}/return`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` || '' },
      });
      if (!res.ok) throw new Error('Return failed');
      setModalVisible(false);
      onRefresh?.();
    } catch (e) {
      alert('Return failed.');
    }
  };

  // ยืมต่อหนังสือ
  const handleExtend = async (id: string) => {
    try {
      const target = list.find(b => (b.id ?? b.book_id) === id);
      if (!target || !canExtend(target)) { // ใช้ Helper
        Alert.alert('ผิดพลาด', 'ไม่สามารถยืมต่อได้ (อาจจะยืมต่อไปแล้ว หรือยังไม่ถึงเวลา)');
        return;
      }
      
      await extendBook(id, userToken!); // เรียกใช้ Service
      Alert.alert('สำเร็จ', 'ยืมต่อหนังสือเรียบร้อยแล้ว');
      setModalVisible(false);
      onRefresh?.();
    } catch (e: any) {
      console.error('Extend failed:', e);
      Alert.alert('ผิดพลาด', e.message || 'ยืมต่อไม่สำเร็จ');
    }
  };

  // 👈 10. Filter logic (เหมือนเดิม แต่ใช้ list ที่ sync แล้ว)
  const filtered = useMemo(() => {
    if (!searchText) return list;
    const s = searchText.toLowerCase();
    return list.filter(
      (b) =>
        ((b.title ?? b.book_title ?? '') as string).toLowerCase().includes(s) ||
        ((b.author ?? b.book_author ?? '') as string).toLowerCase().includes(s)
    );
  }, [list, searchText]);

  // 👈 11. Render การ์ดหนังสือ (ใช้ Component ใหม่)
  const renderItem = ({ item }: { item: any }) => (
    <ShelfBookCard
      item={item}
      onPress={() => {
        // book_id vs id: ส่ง ID ที่ถูกต้องไปยัง Modal
        const activeBookId = item.id ?? item.book_id;
        setActive({ ...item, id: activeBookId }); // ตรวจสอบให้แน่ใจว่า 'active' มี 'id' ที่ถูกต้อง
        setModalVisible(true);
      }}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7fb' }}>
      {/* Header (เหมือนเดิม) */}
  // Render การ์ดหนังสือ
  const renderItem = ({ item }: { item: any }) => {
    const borrowDate = new Date(item.borrow_date ?? item.borrowDate);
    const dueDate = new Date(item.due_date ?? item.dueDate);
    const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;

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
          <View style={[styles.genreBookCover, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 12, color: '#666' }}>No Cover</Text>
          </View>
        )}
        <Text style={styles.genreBookTitle}>{item.title ?? item.book_title ?? ''}</Text>
        <Text style={styles.genreBookAuthor}>{item.author ?? item.book_author ?? ''}</Text>

        <Text style={{ fontSize: 12, color: 'gray', marginTop: 2 }}>
          ยืมวันที่: {borrowDate.toLocaleDateString()}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: isOverdue ? 'red' : 'green',
            marginTop: 2,
            fontWeight: '600',
          }}
        >
          {isOverdue ? 'สิ้นสุดการยืม' : `เหลือเวลาอีก ${daysLeft} วัน`}
        </Text>
        {canExtend(item) && !isOverdue && (
          <Text style={{ fontSize: 12, color: 'blue', marginTop: 2 }}>
            สามารถยืมต่อได้
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7fb' }}>
      {/* Header */}
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

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" />
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
          keyExtractor={(i) => (i.id ?? i.book_id ?? Math.random()).toString()}
          renderItem={renderItem} // 👈 12. ใช้ renderItem ที่สะอาดขึ้น
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 4 }}
        />
      )}

      {/* Modal */}
      <BookInteractionModal
        visible={modalVisible}
        book={active}
        onClose={() => setModalVisible(false)}
        onReturn={handleReturn}
        onExtend={handleExtend}
        canExtend={active ? canExtend(active) : false} // 👈 13. ใช้ helper ที่ import มา
      />
    </View>
  );
}