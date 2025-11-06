import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { canExtend, normalizeBookData } from '../utils/BookHelper';
import styles, { cardWidth } from '../styles/ShelfScreenStyle'; // ใช้อันเดียวกับ ShelfScreen

type CardProps = {
  item: any;
  onPress: () => void;
};

// ใช้ React.memo เพื่อ performance ที่ดีขึ้น
const ShelfBookCard = ({ item, onPress }: CardProps) => {
  // 1. แปลงข้อมูลให้อยู่ในรูปแบบเดียวกัน
  const book = normalizeBookData(item);

  // 2. คำนวณ Logic การแสดงผล
  const daysLeft = Math.ceil((book.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isActiveBorrow = ['borrowed', 'renewed'].includes(book.status);
  const showCanExtend = canExtend(book);

  return (
    <Pressable onPress={onPress} style={{ width: cardWidth, margin: 4 }}>
      {book.cover ? (
        <Image source={{ uri: book.cover }} style={styles.genreBookCover} />
      ) : (
        <View style={[styles.genreBookCover, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 12, color: '#666' }}>No Cover</Text>
        </View>
      )}
      <Text style={styles.genreBookTitle}>{book.title}</Text>
      <Text style={styles.genreBookAuthor}>{book.author}</Text>

      <Text style={{ fontSize: 12, color: 'gray', marginTop: 2 }}>
        ยืมวันที่: {book.borrowDate.toLocaleDateString()}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: isOverdue ? 'red' : 'green',
          marginTop: 2,
          fontWeight: '600',
        }}
      >
        {isOverdue ? (book.status === 'returned' ? 'คืนแล้ว' : 'เกินกำหนด') : (isActiveBorrow ? `เหลือเวลาอีก ${daysLeft} วัน` : 'คืนแล้ว')}
      </Text>
      {showCanExtend && (
        <Text style={{ fontSize: 12, color: 'blue', marginTop: 2 }}>
          สามารถยืมต่อได้
        </Text>
      )}
    </Pressable>
  );
};

export default React.memo(ShelfBookCard);