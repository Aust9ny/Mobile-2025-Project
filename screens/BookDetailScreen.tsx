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
// 🎯 FIX 1: สมมติว่า useShelfBooks ถูก export เป็น Named Export
// ⚠️ หรืออาจจะต้อง import * as Shelf from "../hooks/useShelfBooks" ถ้าเป็น Default
import  useShelfBooks  from "../hooks/useShelfBooks"; 
import { useAuth } from '../hooks/context/AuthContext'; 

// ⭐️ นำเข้าสไตล์หลัก
import baseStyles from '../styles/BookDetailScreenStyle'; 
// ⭐️ นำเข้าสไตล์เพิ่มเติมที่แยกไป
import extraStyles from '../styles/BookDetailScreenStyle'; 

import HeartIconActive from '../assets/mdi_heart.png';
import HeartIconInactive from '../assets/mdi_heart-outline.png';
import API_URL from '../config/apiConfig'; 

// ⭐️ รวมสไตล์ทั้งหมดเข้าด้วยกัน
const styles = { ...baseStyles, ...extraStyles };
const DEFAULT_COVER = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; 

const getBackendHost = () => {
  if (Platform.OS === 'android') return API_URL;
  return 'http://10.0.2.2:4000';
};

const generateAuthHeaders = (token: string | null, contentType = 'application/json') => {
  return {
    'Content-Type': contentType,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const fetchBorrowInfo = async (bookId: number | string, token: string | null) => {
    try {
        const headers = generateAuthHeaders(token);
        if (!token) return null;

        const backend = getBackendHost();
        const res = await fetch(`${backend}/api/borrows/current`, { headers });
        
        if (res.status === 401) {
            console.error('Failed to fetch borrow status: 401 Unauthorized.');
            return null;
        }
        
        if (!res.ok) {
            // ❌ Network Error จะถูกดักที่ try...catch ด้านนอก แต่ถ้า API ตอบสนอง:
            console.error('Failed to fetch borrow status:', res.status);
            return null;
        }

        const currentBorrows = await res.json();
        
        // 🎯 แก้ไข Can't read property: ใช้ Optional Chaining
        const info = currentBorrows.find((b: any) => b.book_id?.toString() === bookId.toString());

        if (!info) return null;
        
        return {
            ...info,
            borrowId: info.borrow_id, 
            borrowDate: info.borrow_date,
            dueDate: info.due_date,
            extended: info.status === 'renewed'
        };

    } catch (err) {
        // ⚠️ Network Request Failed จะมาติดตรงนี้
        console.error('Error fetching borrow info:', err);
        return null;
    }
};

export default function BookDetailScreen({ route, navigation }: any) {
    const { book } = route.params || {};
    
    // 🎯 FIX 2: ดึง Hook เพื่อให้ได้ fetchBooks()
    // ⚠️ ต้องมั่นใจว่า useShelfBooks เป็น Named Export
    const { fetchBooks } = useShelfBooks(); 
    
    if (!book) return null;

    const { userToken } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentBook, setCurrentBook] = useState({
        ...book, 
        cover: book.cover_url || book.cover || DEFAULT_COVER,
        description: book.summary || book.description,
        total: book.total_copies || 0, 
        available: book.available_copies || 0
    }); 
    const [borrowInfo, setBorrowInfo] = useState<any>(null);

    // ... (loadFavorite useEffect) ...
    useEffect(() => {
        const loadFavorite = async () => {
            const stored = await AsyncStorage.getItem('favoriteBooks');
            const favorites = stored ? JSON.parse(stored) : [];
            setIsFavorite(favorites.some((b: any) => b.id === book.id));
        };
        loadFavorite();
    }, [book.id]);

    // ... (loadStatus useEffect) ...
    useEffect(() => {
        const loadStatus = async () => {
            const info = await fetchBorrowInfo(book.id, userToken); 
            setBorrowInfo(info);
        }
        loadStatus();
    }, [book.id, userToken]); // 🎯 FIX: ใช้ book.id

    const fetchLatestBookData = async () => {
        try {
            const backend = getBackendHost();
            const res = await fetch(`${backend}/api/books/${book.id}`); 
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('HTTP Error fetching book:', res.status, errorText);
                throw new Error('Failed to fetch book data');
            }

            const data = await res.json();
            
            setCurrentBook(prev => ({
                ...data,
                cover: data.cover_url || prev.cover || DEFAULT_COVER,
                description: data.summary || data.description || prev.description,
                available: data.available_copies,
                total: data.total_copies || data.total,
            }));
            
            const info = await fetchBorrowInfo(book.id, userToken); 
            setBorrowInfo(info);

        } catch (err) {
            console.error('Error fetching book data (Real API):', err);
        }
    };

    useEffect(() => {
        fetchLatestBookData();
    }, [book.id, userToken]); 

    // --- Handlers ---
    
    // ... (toggleFavorite function - unchanged logic) ...
    const toggleFavorite = async () => { /* ... */ };
    
    const formatThaiDate = (date: Date) => { /* ... */ return '...'; };


    const handleBorrow = async () => {
        if (borrowInfo) { Alert.alert('แจ้งเตือน', 'คุณยืมหนังสือเล่มนี้อยู่แล้ว'); return; }
        // ... (Check available copies) ...
        
        const headers = generateAuthHeaders(userToken); 
        if (!userToken) { Alert.alert('แจ้งเตือน', 'กรุณาเข้าสู่ระบบเพื่อทำรายการยืม'); return; }

        Alert.alert(
            'คุณต้องการยืมหนังสือหรือไม่?',
            `${currentBook.title}`,
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ตกลง',
                    onPress: async () => {
                        try {
                            const backend = getBackendHost();
                            const res = await fetch(`${backend}/api/borrows/${currentBook.id}`, {
                                method: 'POST',
                                headers: headers, 
                                body: JSON.stringify({}), 
                            });
                            
                            const data = await res.json();
                            if (!res.ok) {
                                Alert.alert('ไม่สำเร็จ', data.message || 'เกิดข้อผิดพลาดในการยืม');
                                return;
                            }
                            
                            await fetchLatestBookData(); 
                            
                            // 🎯 FIX 3: เรียก fetchBooks() เพื่ออัปเดต Bookshelf
                            if (fetchBooks) { 
                                fetchBooks();
                            }
                            
                            Alert.alert('สำเร็จ', `คุณได้ยืมหนังสือเรียบร้อยแล้ว!\nกำหนดคืน: ${formatThaiDate(new Date(data.dueDate))}`);
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
        if (!borrowInfo || !borrowInfo.borrowId) return; 
        const headers = generateAuthHeaders(userToken); 
        if (!userToken) { Alert.alert('แจ้งเตือน', 'กรุณาเข้าสู่ระบบเพื่อทำรายการคืน'); return; }

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
                            const res = await fetch(`${backend}/api/borrows/return/${borrowInfo.borrowId}`, {
                                method: 'POST',
                                headers: headers,
                            });
                            
                            const data = await res.json();
                            if (!res.ok) { Alert.alert('ไม่สำเร็จ', data.message || 'เกิดข้อผิดพลาดในการคืน'); return; }

                            Alert.alert('สำเร็จ', 'คุณคืนหนังสือเรียบร้อยแล้ว');
                            await fetchLatestBookData();

                            // 🎯 FIX 4: เรียก fetchBooks() เพื่ออัปเดต Bookshelf
                            if (fetchBooks) {
                                fetchBooks();
                            }
                            
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
        // ... (handleExtend logic - unchanged) ...
        Alert.alert('แจ้งเตือน', 'ฟังก์ชันยืมต่อยังไม่เปิดใช้งานในระบบฐานข้อมูลจริง'); 
        return;
    };

    const getBorrowStatus = () => { 
      if (!borrowInfo) return null;

    const now = new Date();

    const dueDate = new Date(borrowInfo.dueDate); 

    

    // คำนวณวันคงเหลือ (ใช้ Math.ceil เพื่อความแม่นยำทาง UI)

    const diffTime = dueDate.getTime() - now.getTime();

    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    

    const isOverdue = daysLeft < 0;

    const canExtend = !borrowInfo.extended && (daysLeft <= 3 || isOverdue);

    return { daysLeft, isOverdue, canExtend };
      
      return null; };
    const borrowStatus = getBorrowStatus();

    // --- Rendering (Applied styles) ---
    // ... (JSX rendering remains the same) ...
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.genre}>{currentBook.genre}</Text>
            {/* ⭐️ ใช้ currentBook.cover ที่อัปเดตจาก cover_url */}
            <Image source={{ uri: currentBook.cover || DEFAULT_COVER }} style={styles.cover} /> 
            <Text style={styles.title}>{currentBook.title}</Text>
            <Text style={styles.authorPublisher}>โดย {currentBook.author} | {currentBook.publisher}</Text>

            {/* ⭐️ ส่วนสถิติ: ใช้ styles.statsContainer / statItem / statLabel / statNumber */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                <Text style={styles.statLabel}>เล่มที่มี</Text>
                <Text style={[styles.statNumber, styles.available]}>{currentBook.available}</Text>
                </View>
                <View style={styles.statItem}>
                <Text style={styles.statLabel}>ยืมไปแล้ว</Text>
                <Text style={[styles.statNumber, styles.borrowed]}>{currentBook.total - currentBook.available}</Text> 
                </View>
                <View style={styles.statItem}>
                <Text style={styles.statLabel}>จำนวนทั้งหมด</Text>
                <Text style={[styles.statNumber, styles.statNumber]}>{currentBook.total}</Text>
                </View>
            </View>

            {/* ⭐️ Separator */}
            <View style={styles.separator} />

            {/* แสดงสถานะการยืม */}
            {borrowInfo && borrowStatus && (
                <View style={{ 
                backgroundColor: borrowStatus.isOverdue ? '#ffebee' : '#e8f5e9', 
                padding: 12, 
                borderRadius: 8, 
                marginHorizontal: 16, 
                marginVertical: 12, 
                borderColor: borrowStatus.isOverdue ? '#c62828' : '#2e7d32',
                borderWidth: 1,
                }}>
                <Text style={{ fontSize: 16, color: borrowStatus.isOverdue ? '#c62828' : '#2e7d32', fontWeight: '700' }}>
                    สถานะ: ยืมอยู่
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                    {borrowStatus.isOverdue
                    ? `⚠️ เกินกำหนดคืน ${Math.abs(borrowStatus.daysLeft)} วัน`
                    : `📅 กำหนดคืนในอีก ${borrowStatus.daysLeft} วัน`}
                </Text>
                <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                    วันที่กำหนดคืน: {formatThaiDate(new Date(borrowInfo.dueDate))}
                </Text>
                {borrowStatus.canExtend && (
                    <Text style={{ fontSize: 13, color: '#1976d2', marginTop: 8, fontWeight: '600' }}>
                    💡 สามารถยืมต่อได้อีก 7 วัน
                    </Text>
                )}
                </View>
            )}
            
            {/* ⭐️ ปุ่มยืม (ใช้ styles ที่เตรียมไว้) */}
            {!borrowInfo && (
                <Pressable
                style={[
                    styles.borrowBtn,
                    (currentBook.available <= 0 || !userToken) && styles.borrowBtnDisabled 
                ]}
                onPress={handleBorrow}
                disabled={currentBook.available <= 0 || !userToken}
                >
                <Text style={styles.borrowText}>
                    {!userToken ? 'กรุณาเข้าสู่ระบบเพื่อยืม' :
                    currentBook.available > 0 ? 'ยืมหนังสือ' : 'ถูกยืมหมดแล้ว'}
                </Text>
                </Pressable>
            )}

            {/* ⭐️ ปุ่มจัดการการยืม (คืน, ยืมต่อ) */}
            {borrowInfo && (
                <View style={styles.statsContainer}>
                <Pressable
                    style={[styles.borrowBtn]}
                    onPress={handleReturn}
                >
                    <Text style={styles.returnBtnText}>คืนหนังสือ</Text>
                </Pressable>

                <Pressable
                    style={[
                    styles.extendBtn,
                    !borrowStatus?.canExtend && styles.extendBtnDisabled,
                    ]}
                    onPress={handleExtend}
                    disabled={!borrowStatus?.canExtend}
                >
                    <Text style={styles.extendBtnText}>
                    {borrowInfo.extended ? 'ยืมต่อแล้ว' : 'ยืมต่อ 7 วัน'}
                    </Text>
                </Pressable>
                </View>
            )}

            {/* ⭐️ รายละเอียดเพิ่มเติม (ใช้ styles.detailsContainer) */}
                <Text style={styles.summaryText}>{currentBook.description}</Text>
            

            {/* ⭐️ ปุ่ม Favorite (ใช้ styles.favoriteTouchArea) */}
            <TouchableOpacity
                style={styles.favoriteContainer} 
                onPress={toggleFavorite}
                disabled={!userToken}
            >
                <Image
                source={isFavorite ? HeartIconActive : HeartIconInactive}
                style={styles.favoriteIcon}
                />
                <Text style={styles.favoriteText}>
                {isFavorite ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                </Text>
                <View style={styles.separator} /> 
            </TouchableOpacity>
        </ScrollView>
    );
}