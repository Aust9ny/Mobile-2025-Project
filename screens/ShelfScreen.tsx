import React, { useMemo, useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';

// --- Import Service/Helper ---
// ⚠️ ต้องมีไฟล์เหล่านี้ในโปรเจกต์:
import BookInteractionModal from '../components/BookInteractionModal';
import SearchBar from '../components/SearchBar';
import ShelfBookCard from '../components/BookCard'; 
import { returnBook, extendBook } from '../services/BorrowService'; 
import { canExtend } from '../utils/BookHelper'; 
// ---

import NoIcon from '../assets/healthicons_no.png';
// ⚠️ ต้องมีไฟล์ style นี้:
import styles from '../styles/ShelfScreenStyle'; 
// import API_URL from '../config/apiConfig'; // ไม่ได้ใช้โดยตรงในไฟล์นี้
import { useAuth } from '../hooks/context/AuthContext';

type Props = {
  userProfile?: { photoURL?: string };
  isLoading?: boolean;
  shelfBooks?: any[];
  onRefresh?: () => void;
};

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function ShelfScreen({ userProfile, isLoading = false, shelfBooks = [], onRefresh }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  
  const { userToken } = useAuth(); 

  const [list, setList] = useState<any[]>(shelfBooks); 
  const [searchText, setSearchText] = useState('');
  const [active, setActive] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 1. Sync state เมื่อ prop shelfBooks เปลี่ยน
  useEffect(() => {
    setList(shelfBooks);
  }, [shelfBooks]);

  // Logic คืนหนังสือ
  const handleReturn = async (borrowId: string) => { 
    if (!userToken) {
        Alert.alert('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนทำรายการ');
        return;
    }
    try {
      await returnBook(borrowId, userToken); 
      
      // 🎯 Optimistic UI Update: ลบหนังสือออกจาก State list ทันที
      setList(prevList => prevList.filter(book => book.borrow_id !== borrowId));
      
      Alert.alert('สำเร็จ', 'คืนหนังสือเรียบร้อยแล้ว');
      setModalVisible(false);
      onRefresh?.(); // เรียกโหลดข้อมูลใหม่เพื่อยืนยันสถานะล่าสุด
    } catch (e: any) {
      console.error('Return failed:', e);
      Alert.alert('ผิดพลาด', e.message || 'คืนหนังสือไม่สำเร็จ');
    }
  };

  // Logic ยืมต่อ
  const handleExtend = async (borrowId: string) => { 
    if (!userToken) {
        Alert.alert('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนทำรายการ');
        return;
    }
    try {
      const target = list.find(b => b.borrow_id === borrowId);
      
      if (!target || !canExtend(target)) { 
        Alert.alert('ผิดพลาด', 'ไม่สามารถยืมต่อได้ (อาจจะยืมต่อไปแล้ว หรือยังไม่ถึงเวลา)');
        return;
      }
      
      await extendBook(borrowId, userToken); 
      
      // 🎯 Optimistic UI Update: อัปเดตสถานะ extended ใน State list ทันที
      setList(prevList => prevList.map(book => {
        if (book.borrow_id === borrowId) {
            // อัปเดตสถานะเป็นยืมต่อแล้ว
            return { 
                ...book, 
                extended: true,
            };
        }
        return book;
      }));

      Alert.alert('สำเร็จ', 'ยืมต่อหนังสือเรียบร้อยแล้ว');
      setModalVisible(false);
      onRefresh?.(); // เรียกโหลดข้อมูลใหม่เพื่อยืนยันสถานะและวันที่คืนล่าสุด
    } catch (e: any) {
      console.error('Extend failed:', e);
      Alert.alert('ผิดพลาด', e.message || 'ยืมต่อไม่สำเร็จ');
    }
  };

  // Filter logic
  const filtered = useMemo(() => {
    if (!searchText) return list;
    const s = searchText.toLowerCase();
    return list.filter(
      (b) =>
        ((b.title ?? b.book_title ?? '') as string).toLowerCase().includes(s) ||
        ((b.author ?? b.book_author ?? '') as string).toLowerCase().includes(s)
    );
  }, [list, searchText]);

  // Render การ์ดหนังสือ
  const renderItem = ({ item }: { item: any }) => (
    <ShelfBookCard
      item={item}
      onPress={() => {
        const borrowId = item.borrow_id; 
        setActive({ ...item, id: borrowId }); // id ใน Modal คือ borrowId
        setModalVisible(true);
      }}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7fb' }}>
      {/* Header */}
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ชั้นหนังสือ</Text>
          <Pressable onPress={() => navigation.navigate('ProfileScreen')}>
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
          <ActivityIndicator size="small" color="#115566" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>ขออภัย</Text>
          <Text style={styles.emptyText}>ท่านยังไม่มีหนังสือที่ยืม</Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: '#ff6b6b' }]} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => (i.borrow_id ?? i.book_id ?? Math.random()).toString()} 
          renderItem={renderItem} 
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
        onReturn={() => handleReturn(active.id)} 
        onExtend={() => handleExtend(active.id)}
        // ⚠️ ต้องมั่นใจว่า active มีข้อมูลวันที่/สถานะที่ถูกต้องเพื่อตรวจสอบการยืมต่อ
        canExtend={active ? canExtend(active) : false} 
      />
    </View>
  );
}