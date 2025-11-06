// screens/BookDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/BookDetailScreenStyle';
import HeartIconActive from '../assets/mdi_heart.png';
import HeartIconInactive from '../assets/mdi_heart-outline.png';

// ⭐️ 1. Import API_URL และ useAuth
import API_URL from '../config/apiConfig';
import { useAuth } from '../hooks/context/AuthContext';


export default function BookDetailScreen({ route, navigation }: any) {
  const { book } = route.params || {};
  if (!book) return null;

  // ⭐️ 2. ดึง userToken มาจาก Context
  const { userToken } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  // 🔹 โหลดสถานะ Favorite ตอนเปิดหน้าหนังสือ
  useEffect(() => {
    // (Logic นี้ควรจะย้ายไป fetch จาก API /api/library/favorites/mine - ซึ่งอยู่ใน library.routes.js)
    // แต่ตอนนี้เราจะยังคงใช้ AsyncStorage ไปก่อน
    const loadFavoriteStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem('favoriteBooks');
        const favorites = stored ? JSON.parse(stored) : [];
        const exists = favorites.some((b: any) => b.id === book.id);
        setIsFavorite(exists);
      } catch (error) {
        console.error('Error loading favorite status:', error);
      }
    };

    loadFavoriteStatus();
  }, [book]);

  // 🔹 บันทึกประวัติการเข้าชม
  useEffect(() => {
    const addToHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('viewHistory');
        const history = stored ? JSON.parse(stored) : [];

        const existingIndex = history.findIndex((b: any) => b.id === book.id);
        if (existingIndex >= 0) {
          history[existingIndex].viewedAt = new Date().toISOString();
        } else {
          // ⭐️ FIX: ใช้ field ที่ถูกต้องจาก DB (cover_url)
          const historyBook = { 
            id: book.id, 
            title: book.title, 
            author: book.author, 
            cover_url: book.cover_url, 
            viewedAt: new Date().toISOString() 
          };
          history.push(historyBook);
        }

        await AsyncStorage.setItem('viewHistory', JSON.stringify(history));
      } catch (error) {
        console.error('Error saving view history:', error);
      }
    };

  const toggleFavorite = async () => {
    // (Logic นี้ควรจะย้ายไป fetch จาก API POST /api/library/favorites/:bookId)
    // แต่ตอนนี้เราจะยังคงใช้ AsyncStorage ไปก่อน
    try {
      const stored = await AsyncStorage.getItem('favoriteBooks');
      const favorites = stored ? JSON.parse(stored) : [];
      
      // ⭐️ FIX: ใช้ field ที่ถูกต้องจาก DB
      const favoriteBook = { 
        id: book.id, 
        title: book.title, 
        author: book.author, 
        cover_url: book.cover_url 
      };
    addToHistory();
  }, [book]);

  // 🔹 สลับสถานะ Favorite
  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem('favoriteBooks');
      const favorites = stored ? JSON.parse(stored) : [];

      let updatedFavorites;
      if (isFavorite) {
        updatedFavorites = favorites.filter((b: any) => b.id !== book.id);
      } else {
        updatedFavorites = [...favorites, favoriteBook];
      }

      await AsyncStorage.setItem('favoriteBooks', JSON.stringify(updatedFavorites));
      setIsFavorite((prev) => !prev);

      Alert.alert(
        'รายการโปรด',
        isFavorite ? 'ลบออกจากรายการโปรดแล้ว' : 'เพิ่มลงในรายการโปรดแล้ว'
      );
    } catch (error) {
      console.error('Favorite toggle error:', error);
    }
  };

  // 🔹 กดปุ่มยืม (FIXED)
  const handleBorrow = async () => {
    // ... (Logic การแสดงผล dueDateStr เหมือนเดิม) ...
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + 7);
    const thaiMonths = [
      'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
      'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
    ];
    const day = dueDate.getDate();
    const month = thaiMonths[dueDate.getMonth()];
    const year = dueDate.getFullYear() + 543;
    const hours = dueDate.getHours().toString().padStart(2,'0');
    const minutes = dueDate.getMinutes().toString().padStart(2,'0');
    const dueDateStr = `${day} ${month} ${year} เวลา ${hours}:${minutes} น.`;

    Alert.alert(
      'คุณต้องการยืมหนังสือหรือไม่?',
      `${book.title}\n\nกำหนดคืน\n${dueDateStr}`,
      [
        { text: 'ยกเลิก', style: 'destructive' },
        {
          text: 'ตกลง',
          onPress: async () => {
            try {
              // ⭐️ 3. ใช้ userToken จาก useAuth() (ปลอดภัยกว่า)
              if (!userToken) throw new Error('Not authenticated');
              
              // ⭐️ 4. (FIX 1) ใช้ API_URL และ Endpoint ที่ถูกต้อง
              // API Endpoint คือ: POST /api/borrows/:bookId/borrow
              const res = await fetch(`${API_URL}/api/borrows/${book.id}/borrow`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`
                },
                // ⭐️ 5. (FIX 2) ลบ body ออก (API อ่าน ID จาก URL)
              });
              
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || 'Borrow failed');
              
              Alert.alert('สำเร็จ', 'คุณได้ยืมหนังสือเรียบร้อยแล้ว!');
              navigation.goBack();
              
            } catch (error: any) { // ⭐️ 6. (FIX 3)
              console.error('Error borrowing book:', error);
              // แสดง error.message เพื่อให้รู้ว่า Server ตอบอะไรกลับมา
              Alert.alert('ผิดพลาด', error.message || 'ยืมหนังสือไม่สำเร็จ');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.genre}>{book.genre}</Text>
      {/* ⭐️ FIX 1: ใช้ cover_url (ตาม schema) แทน book.cover */}
      <Image source={{ uri: book.cover_url }} style={styles.cover} />
      <Text style={styles.title}>{book.title}</Text>
      {/* ⭐️ FIX 2: API ไม่มี publisher, ใช้ author อย่างเดียว */}
      <Text style={styles.authorPublisher}>
        โดย {book.author}
      </Text>

      <Pressable style={styles.borrowBtn} onPress={handleBorrow}>
        <Text style={styles.borrowText}>ยืมหนังสือเล่มนี้</Text>
      </Pressable>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ยอดคงเหลือ</Text>
          {/* ⭐️ FIX 3: ใช้ available_copies (ตาม schema) */}
          <Text style={[styles.statNumber, styles.available]}>{book.available_copies}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ทั้งหมด</Text>
           {/* ⭐️ FIX 4: ใช้ total_copies (ตาม schema) */}
          <Text style={[styles.statNumber, styles.total]}>{book.total_copies}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ยืมแล้ว</Text>
          {/* ⭐️ FIX 5: คำนวณยอดที่ถูกยืม (และเช็ค Error) */}
          <Text style={[styles.statNumber, styles.borrowed]}>
            {typeof book.total_copies === 'number' && typeof book.available_copies === 'number'
              ? book.total_copies - book.available_copies
              : 'N/A'}
          </Text>
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

      <Text style={styles.summaryText}>{book.summary}</Text>
    </ScrollView>
  );
}