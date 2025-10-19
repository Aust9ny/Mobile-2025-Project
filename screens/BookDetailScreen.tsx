import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/BookDetailScreenStyle';
import HeartIconActive from '../assets/mdi_heart.png';
import HeartIconInactive from '../assets/mdi_heart-outline.png';

export default function BookDetailScreen({ route }: any) {
  const { book } = route.params || {};
  const navigation = useNavigation<any>();
  if (!book) return null;

  const [isFavorite, setIsFavorite] = useState(false);

  // โหลดสถานะ favorite
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const stored = await AsyncStorage.getItem('favoriteBooks');
        const favorites = stored ? JSON.parse(stored) : [];
        setIsFavorite(favorites.some((b: any) => b.id === book.id));
      } catch (e) {
        console.error(e);
      }
    };
    checkFavorite();
  }, [book]);

  // Toggle favorite
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
      Alert.alert('รายการโปรด', isFavorite ? 'ลบออกจากรายการโปรดแล้ว' : 'เพิ่มลงในรายการโปรดแล้ว');
    } catch (e) {
      console.error(e);
    }
  };

  // บันทึก view history
  useEffect(() => {
    const saveViewHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('viewHistory');
        const history = stored ? JSON.parse(stored) : [];

        const newHistory = [
          { ...book, viewedAt: new Date().toISOString() },
          ...history.filter((b: any) => b.id !== book.id),
        ];

        await AsyncStorage.setItem('viewHistory', JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save view history', e);
      }
    };
    saveViewHistory();
  }, [book]);

  // ยืมหนังสือ
  const handleBorrow = async () => {
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const newBorrow = {
      id: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      borrowDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
      extended: false,
    };

    try {
      const storedHistory = await AsyncStorage.getItem('borrowHistory');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      const updatedHistory = [newBorrow, ...history.filter((b: any) => b.id !== book.id)];
      await AsyncStorage.setItem('borrowHistory', JSON.stringify(updatedHistory));

      Alert.alert('สำเร็จ', 'คุณได้ยืมหนังสือเรียบร้อยแล้ว!', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error('Failed to borrow book', e);
      Alert.alert('ผิดพลาด', 'ไม่สามารถยืมหนังสือได้');
    }
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
