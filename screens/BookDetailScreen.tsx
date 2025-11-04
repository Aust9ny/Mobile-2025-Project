import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/BookDetailScreenStyle';
import HeartIconActive from '../assets/mdi_heart.png';
import HeartIconInactive from '../assets/mdi_heart-outline.png';

const getBackendHost = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
  return 'http://localhost:4000';
};

export default function BookDetailScreen({ route, navigation }: any) {
  const { book } = route.params || {};
  if (!book) return null;

  const [isFavorite, setIsFavorite] = useState(false);
  const [currentBook, setCurrentBook] = useState(book);
  const [borrowInfo, setBorrowInfo] = useState<any>(null);

  // โหลด favorite
  useEffect(() => {
    const loadFavorite = async () => {
      const stored = await AsyncStorage.getItem('favoriteBooks');
      const favorites = stored ? JSON.parse(stored) : [];
      setIsFavorite(favorites.some((b: any) => b.id === book.id));
    };
    loadFavorite();
  }, [book]);

  // โหลด borrow status
  useEffect(() => {
    loadBorrowStatus();
  }, [book]);

  const loadBorrowStatus = async () => {
    const stored = await AsyncStorage.getItem('borrowHistory');
    const history = stored ? JSON.parse(stored) : [];
    const info = history.find((b: any) => b.id === book.id);
    setBorrowInfo(info || null);
  };

  // ดึงข้อมูลหนังสือล่าสุดจาก backend
  const fetchLatestBookData = async () => {
    try {
      const backend = getBackendHost();
      const res = await fetch(`${backend}/api/books/mock/${book.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCurrentBook(data);
    } catch (err) {
      console.error('Error fetching book data:', err);
    }
  };

  useEffect(() => {
    fetchLatestBookData();
  }, []);

  const toggleFavorite = async () => {
    const stored = await AsyncStorage.getItem('favoriteBooks');
    const favorites = stored ? JSON.parse(stored) : [];
    let updated;
    if (isFavorite) updated = favorites.filter((b: any) => b.id !== book.id);
    else updated = [...favorites, book];
    await AsyncStorage.setItem('favoriteBooks', JSON.stringify(updated));
    setIsFavorite(prev => !prev);
    Alert.alert('รายการโปรด', isFavorite ? 'ลบออกจากรายการโปรดแล้ว' : 'เพิ่มลงในรายการโปรดแล้ว');
  };

  const formatThaiDate = (date: Date) => {
    const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543} เวลา ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')} น.`;
  };

  const handleBorrow = async () => {
    if (borrowInfo) {
      Alert.alert('แจ้งเตือน', 'คุณยืมหนังสือเล่มนี้อยู่แล้ว');
      return;
    }
    if (currentBook.available <= 0) {
      Alert.alert('ไม่สามารถยืมได้', 'หนังสือเล่มนี้ถูกยืมหมดแล้ว');
      return;
    }

    const backend = getBackendHost();
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate.getTime() + 7*24*60*60*1000);
    const dueDateStr = formatThaiDate(dueDate);

    Alert.alert(
      'คุณต้องการยืมหนังสือหรือไม่?',
      `${currentBook.title}\n\nกำหนดคืน: ${dueDateStr}`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ตกลง',
          onPress: async () => {
            try {
              const res = await fetch(`${backend}/api/borrows/mock/${currentBook.id}/borrow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'demo-user', action: 'borrow' }),
              });
              const data = await res.json();
              if (!res.ok) {
                Alert.alert('ไม่สำเร็จ', data.error || 'เกิดข้อผิดพลาด');
                return;
              }

              setCurrentBook(data.book);

              const newBorrowInfo = {
                ...data.book,
                borrowDate: borrowDate.toISOString(),
                dueDate: dueDate.toISOString(),
                extended: false
              };

              const storedHistory = await AsyncStorage.getItem('borrowHistory');
              const history = storedHistory ? JSON.parse(storedHistory) : [];
              history.push(newBorrowInfo);
              await AsyncStorage.setItem('borrowHistory', JSON.stringify(history));

              setBorrowInfo(newBorrowInfo);
              Alert.alert('สำเร็จ', `คุณได้ยืมหนังสือเรียบร้อยแล้ว!\nกำหนดคืน: ${dueDateStr}`);
            } catch (err) {
              console.error(err);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
            }
          }
        }
      ]
    );
  };

  const handleReturn = async () => {
    if (!borrowInfo) return;

    Alert.alert(
      'ยืนยันการคืนหนังสือ',
      `คุณต้องการคืนหนังสือ "${currentBook.title}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'คืนหนังสือ',
          onPress: async () => {
            const backend = getBackendHost();
            try {
              const res = await fetch(`${backend}/api/borrows/mock/${currentBook.id}/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: 'demo-user',
                  borrowDate: borrowInfo.borrowDate,
                  dueDate: borrowInfo.dueDate
                }),
              });
              const data = await res.json();
              if (!res.ok) {
                Alert.alert('ไม่สำเร็จ', data.error || 'เกิดข้อผิดพลาด');
                return;
              }

              setCurrentBook(data.book);
              setBorrowInfo(null);

              const storedHistory = await AsyncStorage.getItem('borrowHistory');
              const history = storedHistory ? JSON.parse(storedHistory) : [];
              const updated = history.filter((b: any) => b.id !== currentBook.id);
              await AsyncStorage.setItem('borrowHistory', JSON.stringify(updated));

              Alert.alert('สำเร็จ', 'คุณคืนหนังสือเรียบร้อยแล้ว');

              await fetchLatestBookData();
            } catch (err) {
              console.error(err);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
            }
          }
        }
      ]
    );
  };

  const handleExtend = async () => {
    if (!borrowInfo || borrowInfo.extended) return;

    const backend = getBackendHost();
    try {
      const res = await fetch(`${backend}/api/borrows/mock/${currentBook.id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          borrowDate: borrowInfo.borrowDate,
          dueDate: borrowInfo.dueDate
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('ไม่สำเร็จ', data.error || 'เกิดข้อผิดพลาด');
        return;
      }

      const newDueDate = new Date(new Date(borrowInfo.dueDate).getTime() + 7*24*60*60*1000);
      const dueDateStr = formatThaiDate(newDueDate);

      setCurrentBook(data.book);

      const updatedBorrowInfo = {
        ...borrowInfo,
        dueDate: newDueDate.toISOString(),
        extended: true
      };

      const storedHistory = await AsyncStorage.getItem('borrowHistory');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      const updated = history.map((b: any) =>
        b.id === currentBook.id ? updatedBorrowInfo : b
      );
      await AsyncStorage.setItem('borrowHistory', JSON.stringify(updated));

      setBorrowInfo(updatedBorrowInfo);
      Alert.alert('สำเร็จ', `ยืมต่อหนังสือเรียบร้อยแล้ว!\nกำหนดคืนใหม่: ${dueDateStr}`);
    } catch (err) {
      console.error(err);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  const getBorrowStatus = () => {
    if (!borrowInfo) return null;

    const now = new Date();
    const dueDate = new Date(borrowInfo.dueDate);
    const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000*60*60*24));
    const isOverdue = daysLeft < 0;

    const canExtend = !borrowInfo.extended && (daysLeft <=3 || isOverdue);

    return { daysLeft, isOverdue, canExtend };
  };

  const borrowStatus = getBorrowStatus();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.genre}>{currentBook.genre}</Text>
      <Image source={{ uri: currentBook.cover }} style={styles.cover} />
      <Text style={styles.title}>{currentBook.title}</Text>
      <Text style={styles.authorPublisher}>โดย {currentBook.author} | {currentBook.publisher}</Text>

      {borrowInfo && borrowStatus && (
        <View style={{ backgroundColor: borrowStatus.isOverdue ? '#ffebee' : '#e8f5e9', padding: 12, borderRadius: 8, marginVertical: 8 }}>
          <Text style={{ fontSize: 14, color: borrowStatus.isOverdue ? '#c62828' : '#2e7d32', fontWeight: '600' }}>
            {borrowStatus.isOverdue
              ? `⚠️ เกินกำหนดคืนแล้ว ${Math.abs(borrowStatus.daysLeft)} วัน`
              : `📅 เหลือเวลาอีก ${borrowStatus.daysLeft} วัน`}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            กำหนดคืน: {formatThaiDate(new Date(borrowInfo.dueDate))}
          </Text>
          {borrowStatus.canExtend && (
            <Text style={{ fontSize: 12, color: '#1976d2', marginTop: 4 }}>
              💡 สามารถยืมต่อได้อีก 7 วัน
            </Text>
          )}
        </View>
      )}

      {!borrowInfo && (
        <Pressable
          style={[styles.borrowBtn, currentBook.available <= 0 && { backgroundColor: '#ccc' }]}
          onPress={handleBorrow}
          disabled={currentBook.available <= 0}
        >
          <Text style={styles.borrowText}>
            {currentBook.available <= 0 ? 'หนังสือถูกยืมหมด' : 'ยืมหนังสือเล่มนี้'}
          </Text>
        </Pressable>
      )}

      {borrowInfo && borrowStatus && (
        <>
          {borrowStatus.canExtend && (
            <Pressable
              style={[styles.borrowBtn, { backgroundColor: '#1976d2' }]}
              onPress={handleExtend}
            >
              <Text style={styles.borrowText}>ยืมต่ออีก 7 วัน</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.borrowBtn, { backgroundColor: '#f44336', marginTop: 8 }]}
            onPress={handleReturn}
          >
            <Text style={styles.borrowText}>คืนหนังสือ</Text>
          </Pressable>
        </>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ยอดคงเหลือ</Text>
          <Text style={[styles.statNumber, styles.available]}>{currentBook.available}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ทั้งหมด</Text>
          <Text style={[styles.statNumber, styles.total]}>{currentBook.total}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ยืมแล้ว</Text>
          <Text style={[styles.statNumber, styles.borrowed]}>{currentBook.borrowed}</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>เรื่องย่อ</Text>
        <TouchableOpacity style={styles.favoriteContainer} onPress={toggleFavorite}>
          <Image source={isFavorite ? HeartIconActive : HeartIconInactive} style={styles.favoriteIcon} />
          <Text style={styles.favoriteText}>รายการโปรด</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.summaryText}>{currentBook.summary}</Text>
    </ScrollView>
  );
}
