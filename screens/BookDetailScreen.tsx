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

import { API_URL } from '../services/config';

export default function BookDetailScreen({ route, navigation }: any) {
  const { book } = route.params || {};
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

  const loadBookStats = async () => {
    try {
      const backend = getBackendHost();
      const res = await fetch(`${backend}/api/books/mock/${bookId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setBookStats({
          total: data.total || 10,
          borrowed: data.borrowed || 0,
          available: data.available || 10,
        });
      }
    } catch (err) {
      // Silent error
    }
  };

  const checkUserBorrowStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem('borrowHistory');
      const history = stored ? JSON.parse(stored) : [];
      const hasBorrowed = history.some((b: any) => b.id === bookId);
      setUserHasBorrowed(hasBorrowed);
    } catch (err) {
      // Silent error
    }
  };

  // ✅ โหลดทุกครั้งที่กลับมาหน้านี้
  useFocusEffect(
    React.useCallback(() => {
      loadBookStats();
      checkUserBorrowStatus();
    }, [bookId])
  );

  // ✅ โหลดอีกครั้งเมื่อ userId พร้อม
  useEffect(() => {
    if (userId) {
      loadBookStats();
      checkUserBorrowStatus();
    }
  }, [userId, bookId]);

  // ✅ โหลด favorite list
  useEffect(() => {
    if (!userId) return;
    const loadFavorite = async () => {
      try {
        const backend = getBackendHost();
        const res = await fetch(`${backend}/api/users/1/favorites`);
        const data = await res.json();
        if (res.ok && data.favorites) {
          const favorited = data.favorites.some((b: any) => b.id === bookId);
          setIsFavorite(favorited);
        }
      } catch (err) {
        // Silent error
      } finally {
        setIsLoading(false);
      }
    };
    loadFavorite();
  }, [bookId, userId]);

  const toggleFavorite = async () => {
    const action = isFavorite ? 'remove' : 'add';
    setIsFavorite(prev => !prev);
    if (onFavoriteChange) onFavoriteChange(bookId, action);

    try {
      const backend = getBackendHost();
      const res = await fetch(`${backend}/api/users/1/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: Number(bookId), action }),
      });

      if (!res.ok) {
        setIsFavorite(prev => !prev);
        if (onFavoriteChange) onFavoriteChange(bookId, isFavorite ? 'add' : 'remove');
        const data = await res.json();
        Alert.alert('ข้อผิดพลาด', data.error || 'ไม่สามารถอัปเดตรายการโปรดได้');
        return;
      }

      Alert.alert(
        'รายการโปรด',
        action === 'add' ? 'เพิ่มลงในรายการโปรดแล้ว' : 'ลบออกจากรายการโปรดแล้ว'
      );
    } catch (err) {
      setIsFavorite(prev => !prev);
      if (onFavoriteChange) onFavoriteChange(bookId, isFavorite ? 'add' : 'remove');
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

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
              const token = await AsyncStorage.getItem('authToken');
              if (!token) throw new Error('Not authenticated');
              const res = await fetch(`${API_URL}/borrows`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ book_id: book.id })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || 'Borrow failed');
              Alert.alert('สำเร็จ', 'คุณได้ยืมหนังสือเรียบร้อยแล้ว!');
              navigation.goBack();
            } catch (error) {
              console.error('Error borrowing book:', error);
              Alert.alert('ผิดพลาด', 'ยืมหนังสือไม่สำเร็จ');
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
        style={[
          styles.borrowButton,
          (bookStats.available <= 0 || userHasBorrowed) && styles.borrowButtonDisabled
        ]}
        onPress={handleBorrowBook}
        activeOpacity={0.8}
        disabled={bookStats.available <= 0 || userHasBorrowed}
      >
        <Text style={styles.borrowButtonText}>
          {userHasBorrowed ? 'คุณยืมหนังสือเล่มนี้อยู่แล้ว' : 
           bookStats.available > 0 ? 'ยืมหนังสือเล่มนี้' : 'หนังสือหมด'}
        </Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>คงเหลือ</Text>
          <Text style={styles.statValue}>{bookStats.available}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ทั้งหมด</Text>
          <Text style={[styles.statValue, styles.statValueRed]}>{bookStats.total}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ยืมแล้ว</Text>
          <Text style={[styles.statValue, styles.statValueRed]}>{bookStats.borrowed}</Text>
        </View>
      </View>

      <View style={styles.divider} />

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
