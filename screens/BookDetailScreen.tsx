// BookDetailScreen.tsx (Database Version)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/BookDetailScreenStyle';
import HeartIconActive from '../assets/mdi_heart.png';
import HeartIconInactive from '../assets/mdi_heart-outline.png';

const DEFAULT_COVER = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

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

const formatThaiDateTime = (date: Date) => {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  const dayName = thaiDays[date.getDay()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `วัน${dayName}ที่ ${day} ${month} ${year} เวลา ${hours}:${minutes} น.`;
};

export default function BookDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { book, onFavoriteChange, userId: propsUserId } = route.params || {};
  if (!book) return null;

  const [isFavorite, setIsFavorite] = useState(false);
  const [currentBook, setCurrentBook] = useState(book);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookStats, setBookStats] = useState({
    total: 10,
    borrowed: 0,
    available: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userHasBorrowed, setUserHasBorrowed] = useState(false);

  const bookId = currentBook.id;

  useEffect(() => {
    const loadUserId = async () => {
      const id = propsUserId || await getTempUserId();
      setUserId(id);
    };
    loadUserId();
  }, [propsUserId]);

  // ✅ โหลดสถิติหนังสือจาก database
  const loadBookStats = async () => {
    try {
      const backend = getBackendHost();
      const res = await fetch(`${backend}/api/borrows/mock/${bookId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setBookStats({
          total: data.total || 10,
          borrowed: data.borrowed || 0,
          available: data.available || 10,
        });
      }
    } catch (err) {
      console.error('Error loading book stats:', err);
    }
  };

  // ✅ ตรวจสอบว่า user ยืมหนังสือนี้อยู่หรือไม่ (จาก database)
  const checkUserBorrowStatus = async () => {
    if (!userId) return;
    
    try {
      const backend = getBackendHost();
      const res = await fetch(`${backend}/api/borrows/user/${userId}`);
      
      if (res.ok) {
        const data = await res.json();
        const hasBorrowed = data.borrows?.some((b: any) => b.book_id === parseInt(bookId));
        setUserHasBorrowed(hasBorrowed);
      }
    } catch (err) {
      console.error('Error checking borrow status:', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadBookStats();
      checkUserBorrowStatus();
    }, [bookId, userId])
  );

  useEffect(() => {
    if (userId) {
      loadBookStats();
      checkUserBorrowStatus();
    }
  }, [userId, bookId]);

  // ✅ โหลดสถานะ favorite จาก database
  useEffect(() => {
    if (!userId) return;
    
    const loadFavorite = async () => {
      try {
        const backend = getBackendHost();
        console.log(`📡 [BookDetail] Checking favorite status for user: ${userId}, book: ${bookId}`);
        
        const res = await fetch(`${backend}/api/users/favorites/${userId}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`❌ [BookDetail] HTTP ${res.status}:`, errorText);
          throw new Error(`Failed to fetch favorites: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.favorites) {
          const favorited = data.favorites.some((b: any) => b.id === parseInt(bookId));
          setIsFavorite(favorited);
          console.log(`✅ [BookDetail] Book ${bookId} is ${favorited ? 'favorited' : 'not favorited'}`);
        }
      } catch (err: any) {
        console.error('❌ [BookDetail] Error loading favorites:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFavorite();
  }, [bookId, userId]);

  // ✅ Toggle favorite (บันทึกลง database)
  const toggleFavorite = async () => {
    if (!userId) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถระบุผู้ใช้ได้');
      return;
    }

    const action = isFavorite ? 'remove' : 'add';
    const previousState = isFavorite;
    
    // Optimistic update
    setIsFavorite(!isFavorite);
    if (onFavoriteChange) onFavoriteChange(bookId, action);

    try {
      const backend = getBackendHost();
      console.log(`📡 [BookDetail] ${action === 'add' ? 'Adding' : 'Removing'} favorite: user=${userId}, book=${bookId}`);
      
      const res = await fetch(`${backend}/api/users/favorites/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: parseInt(bookId), action }),
      });

      if (!res.ok) {
        // Revert on failure
        setIsFavorite(previousState);
        if (onFavoriteChange) onFavoriteChange(bookId, previousState ? 'add' : 'remove');
        
        const errorText = await res.text();
        console.error(`❌ [BookDetail] Toggle favorite failed: ${res.status}`, errorText);
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตรายการโปรดได้');
        return;
      }

      const data = await res.json();
      console.log(`✅ [BookDetail] Toggle favorite success:`, data);

      Alert.alert(
        'รายการโปรด',
        action === 'add' ? 'เพิ่มลงในรายการโปรดแล้ว' : 'ลบออกจากรายการโปรดแล้ว'
      );
    } catch (err: any) {
      // Revert on error
      setIsFavorite(previousState);
      if (onFavoriteChange) onFavoriteChange(bookId, previousState ? 'add' : 'remove');
      console.error('❌ [BookDetail] Error toggling favorite:', err);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  // ✅ ยืมหนังสือ (บันทึกลง database)
  const handleBorrowBook = async () => {
    if (!userId) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถระบุผู้ใช้ได้');
      return;
    }

    if (userHasBorrowed) {
      Alert.alert('แจ้งเตือน', 'คุณยืมหนังสือเล่มนี้อยู่แล้ว');
      return;
    }

    if (bookStats.available <= 0) {
      Alert.alert('แจ้งเตือน', 'หนังสือเล่มนี้ยืมหมดแล้ว');
      return;
    }

    const now = new Date();
    const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueDateThai = formatThaiDateTime(dueDate);

    Alert.alert(
      'ยืมหนังสือ',
      `คุณต้องการยืม "${currentBook.title}" ใช่หรือไม่?\n\nกำหนดคืน:\n${dueDateThai}`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืม',
          onPress: async () => {
            try {
              const backend = getBackendHost();
              const res = await fetch(`${backend}/api/borrows/mock/${bookId}/borrow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'borrow' }),
              });

              const data = await res.json();

              if (!res.ok) {
                Alert.alert('ไม่สามารถยืมได้', data.error || 'เกิดข้อผิดพลาด');
                return;
              }

              // อัปเดตสถิติ
              if (data.updatedStats) {
                setBookStats(data.updatedStats);
              } else {
                await loadBookStats();
              }

              // อัปเดตสถานะการยืม
              setUserHasBorrowed(true);

              const returnDate = data.dueDate ? new Date(data.dueDate) : dueDate;
              const returnDateThai = formatThaiDateTime(returnDate);

              Alert.alert(
                'ยืมหนังสือสำเร็จ',
                `"${currentBook.title}"\n\nกำหนดคืน:\n${returnDateThai}\n\nหนังสือจะแสดงในชั้นหนังสือของคุณ`
              );
            } catch (err) {
              console.error('Error borrowing book:', err);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#115566" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.genre}>{currentBook.genre}</Text>
      <Image
        source={{ uri: currentBook.cover?.trim() || DEFAULT_COVER }}
        style={styles.cover}
      />
      <Text style={styles.title}>{currentBook.title}</Text>
      <Text style={styles.authorPublisher}>
        โดย {currentBook.author} | {currentBook.publisher || 'ไม่ระบุ'}
      </Text>

      <TouchableOpacity 
        style={[styles.borrowBtn, (bookStats.available <= 0 || userHasBorrowed) && { opacity: 0.6 }]}
        onPress={handleBorrowBook}
        activeOpacity={0.8}
        disabled={bookStats.available <= 0 || userHasBorrowed}
      >
        <Text style={styles.borrowText}>
          {userHasBorrowed ? 'คุณยืมหนังสือเล่มนี้อยู่แล้ว' : 
           bookStats.available > 0 ? 'ยืมหนังสือเล่มนี้' : 'หนังสือหมด'}
        </Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>คงเหลือ</Text>
          <Text style={[styles.statNumber, styles.available]}>{bookStats.available}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ทั้งหมด</Text>
          <Text style={[styles.statNumber, styles.total]}>{bookStats.total}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ยืมแล้ว</Text>
          <Text style={[styles.statNumber, styles.borrowed]}>{bookStats.borrowed}</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>เรื่องย่อ</Text>
        <TouchableOpacity style={styles.favoriteContainer} onPress={toggleFavorite}>
          <Image
            source={isFavorite ? HeartIconActive : HeartIconInactive}
            style={styles.favoriteIcon}
          />
          <Text style={styles.favoriteText}>รายการโปรด</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.summaryText}>{currentBook.summary || 'ไม่มีเรื่องย่อ'}</Text>
    </ScrollView>
  );
}