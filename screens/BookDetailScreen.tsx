import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../styles/BookDetailScreenStyle';
import HeartIconActive from '../assets/mdi_heart.png';
import HeartIconInactive from '../assets/mdi_heart-outline.png';

const DEFAULT_COVER = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const getBackendHost = () =>
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export default function BookDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { book, onFavoriteChange } = route.params || {};
  if (!book) return null;

  const [isFavorite, setIsFavorite] = useState(false);
  const [currentBook, setCurrentBook] = useState(book);
  const userId = 1;

  const bookId = Number(currentBook.id);

  // โหลด favorite status แค่ครั้งแรก
  useEffect(() => {
    const loadFavorite = async () => {
      try {
        const backend = getBackendHost();
        const res = await fetch(`${backend}/api/users/${userId}/favorites`);
        const data = await res.json();
        if (res.ok && data.favorites) {
          const favorited = data.favorites.some((b: any) => Number(b.id) === bookId);
          setIsFavorite(favorited);
        }
      } catch (err) {
        console.error('[BookDetail] Failed to load favorites:', err);
      }
    };
    loadFavorite();
  }, [bookId]);

  const toggleFavorite = async () => {
    const action = isFavorite ? 'remove' : 'add';

    // อัปเดต UI ทันที
    setIsFavorite(prev => !prev);

    // อัปเดต FavoriteScreen ผ่าน callback ถ้ามี
    if (onFavoriteChange) onFavoriteChange(bookId, action);

    try {
      const backend = getBackendHost();
      const res = await fetch(`${backend}/api/users/${userId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, action }),
      });

      if (!res.ok) {
        // ถ้าล้มเหลว ย้อนกลับ UI
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
      // ถ้า request ล้มเหลว ย้อนกลับ UI
      setIsFavorite(prev => !prev);
      if (onFavoriteChange) onFavoriteChange(bookId, isFavorite ? 'add' : 'remove');

      console.error('[BookDetail] Favorite request failed:', err);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.genre}>{currentBook.genre}</Text>
      <Image
        source={{ uri: currentBook.cover?.trim() || DEFAULT_COVER }}
        style={styles.cover}
      />
      <Text style={styles.title}>{currentBook.title}</Text>
      <Text style={styles.authorPublisher}>
        โดย {currentBook.author} | {currentBook.publisher}
      </Text>

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

      <Text style={styles.summaryText}>{currentBook.summary}</Text>
    </ScrollView>
  );
}
