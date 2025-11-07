import { useState, useEffect } from 'react';
import API_URL from '../config/apiConfig';
import { useAuth } from '../hooks/context/AuthContext';
import { generateAuthHeaders } from '../utils/AuthHelper';
import { Platform } from 'react-native';

const DEFAULT_COVER_URL = 'https://via.placeholder.com/150x200/386156/FFFFFF?text=No+Cover';

const getBackendHost = () => {
    if (Platform.OS === 'android') return API_URL;
    return 'http://localhost:4000';
};

/**
 * Custom Hook เพื่อดึงรายการหนังสือที่ผู้ใช้กำลังยืมอยู่
 */
export default function useShelfData() {
    const { userToken } = useAuth();
    const [shelfBooks, setShelfBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ⭐️ ลบ Argument 'res' ออก เนื่องจากไม่มีการส่งเข้ามาจาก useEffect
    const fetchBooks = async () => { 
        if (!userToken) {
            setShelfBooks([]); // ล้างรายการถ้าไม่มี Token
            return;
        }

        setIsLoading(true);
        try {
            const backend = getBackendHost();
            const headers = generateAuthHeaders(userToken); 
            
            // 1. เรียก API
            const res = await fetch(`${backend}/api/borrows/current`, { headers });
            
            if (res.status === 401) {
                console.error("Authentication expired or invalid for shelf fetch.");
                setShelfBooks([]);
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to fetch shelf data.');
            }

            const data = await res.json();
            
            // 2. 🎯 สำคัญ: Mapping cover_url -> cover และ summary -> description
            const mappedShelfBooks = data.map((item: any) => ({
                ...item,
                // แมป Field จาก DB (cover_url) ไปยัง Field ที่ Frontend ใช้ (cover)
                cover: item.cover_url || item.cover || DEFAULT_COVER_URL, 
                // แมป Summary ไปยัง Description (ถ้าจำเป็น)
                description: item.summary || item.description,
            }));
            
            setShelfBooks(mappedShelfBooks);

        } catch (error) {
            console.error("Error fetching shelf data:", error);
            setShelfBooks([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger การ Fetch เมื่อ Token เปลี่ยน หรือเมื่อมีการเรียก fetchBooks (ผ่าน refreshTrigger)
    useEffect(() => {
        fetchBooks();
    }, [userToken, refreshTrigger]); 

    // ฟังก์ชันสำหรับเรียก refresh จากภายนอก
    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    return { 
        shelfBooks, 
        isLoading, 
        fetchBooks: triggerRefresh, // ส่ง triggerRefresh ออกไปในชื่อ fetchBooks
    };
}