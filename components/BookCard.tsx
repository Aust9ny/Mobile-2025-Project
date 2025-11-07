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
  // 1. แปลงข้อมูลให้อยู่ในรูปแบบเดียวกัน (book.borrowDate และ book.dueDate เป็น Date object แล้ว)
  const book = normalizeBookData(item);

  // 2. คำนวณ Logic การแสดงผล
  // ใช้ book.dueDate และ book.borrowDate ที่ถูกแปลงเป็น Date object แล้ว
  const dueDate = book.dueDate;
  const now = new Date();
  
  // Math.ceil สำคัญเพื่อให้เห็นว่า "วันนี้" ก็ยังเหลือ 1 วัน
  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  // สถานะใน borrows: 'borrowed', 'renewed', 'returned', 'overdue'
  const isActiveBorrow = ['borrowed', 'renewed', 'overdue'].includes(book.status);
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

      {/* แสดงวันที่ยืมและกำหนดคืน */}
      <Text style={{ fontSize: 12, color: 'gray', marginTop: 2 }}>
        ยืมวันที่: {book.borrowDate ? book.borrowDate.toLocaleDateString() : '-'}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: isOverdue ? 'red' : (book.status === 'returned' ? 'gray' : '#00796b'), // สีเขียวเข้ม
          marginTop: 2,
          fontWeight: '600',
        }}
      >
        {isOverdue ? `เกินกำหนด ${Math.abs(daysLeft)} วัน` : 
         book.status === 'returned' ? 'คืนแล้ว' : 
         isActiveBorrow ? `เหลือเวลาอีก ${daysLeft} วัน` : 
         'ไม่ทราบสถานะ'}
      </Text>
      {showCanExtend && (
        <Text style={{ fontSize: 12, color: 'blue', marginTop: 2, fontWeight: 'bold' }}>
          ยืมต่อได้!
        </Text>
      )}
    </Pressable>
  );
};

export default React.memo(ShelfBookCard);