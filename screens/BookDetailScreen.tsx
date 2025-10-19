// screens/BookDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles/BookDetailScreenStyle';
import HeartIconActive from '../assets/mdi_heart.png';
import HeartIconInactive from '../assets/mdi_heart-outline.png';

export default function BookDetailScreen({ route, navigation }: any) {
  const { book } = route.params || {};
  if (!book) return null;

  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
    Alert.alert(
      'รายการโปรด',
      isFavorite ? 'ลบออกจากรายการโปรดแล้ว' : 'เพิ่มลงในรายการโปรดแล้ว'
    );
  };

  const handleBorrow = () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

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
          onPress: () => {
            // สำหรับตอนนี้ยังไม่ต่อ backend
            Alert.alert('สำเร็จ', 'คุณได้ยืมหนังสือเรียบร้อยแล้ว!');
            navigation.goBack(); // กลับไปหน้าชั้นหนังสือ
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
