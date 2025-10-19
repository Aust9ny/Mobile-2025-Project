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

export default function BookDetailScreen({ route, navigation }: any) {
  const { book } = route.params || {};
  if (!book) return null;

  const [isFavorite, setIsFavorite] = useState(false);

  // 🔹 โหลดสถานะ Favorite ตอนเปิดหน้าหนังสือ
  useEffect(() => {
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
          history.push({ ...book, viewedAt: new Date().toISOString() });
        }

        await AsyncStorage.setItem('viewHistory', JSON.stringify(history));
      } catch (error) {
        console.error('Error saving view history:', error);
      }
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
        updatedFavorites = [...favorites, book];
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

  // 🔹 กดปุ่มยืม
  const handleBorrow = async () => {
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
              // 🔹 บันทึกเข้าชั้นหนังสือ
              const storedShelf = await AsyncStorage.getItem('bookshelf');
              const shelf = storedShelf ? JSON.parse(storedShelf) : [];
              if (!shelf.some((b: any) => b.id === book.id)) {
                shelf.push(book);
                await AsyncStorage.setItem('bookshelf', JSON.stringify(shelf));
              }

              // 🔹 บันทึก borrowHistory
              const storedHistory = await AsyncStorage.getItem('borrowHistory');
              const history = storedHistory ? JSON.parse(storedHistory) : [];

              const newBorrow = {
                ...book,
                borrowDate: borrowDate.toISOString(),
                dueDate: dueDate.toISOString(),
                extended: false,
              };

              history.push(newBorrow);
              await AsyncStorage.setItem('borrowHistory', JSON.stringify(history));

              Alert.alert('สำเร็จ', 'คุณได้ยืมหนังสือเรียบร้อยแล้ว!');
              navigation.goBack();
            } catch (error) {
              console.error('Error borrowing book:', error);
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
      <Image source={{ uri: book.cover }} style={styles.cover} />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.authorPublisher}>
        โดย {book.author} | {book.publisher}
      </Text>

      <Pressable style={styles.borrowBtn} onPress={handleBorrow}>
        <Text style={styles.borrowText}>ยืมหนังสือเล่มนี้</Text>
      </Pressable>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ยอดคงเหลือ</Text>
          <Text style={[styles.statNumber, styles.available]}>{book.available}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ทั้งหมด</Text>
          <Text style={[styles.statNumber, styles.total]}>{book.total}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ยืมแล้ว</Text>
          <Text style={[styles.statNumber, styles.borrowed]}>{book.borrowed}</Text>
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
