import API_URL from '../config/apiConfig';
import { generateAuthHeaders } from '../utils/AuthHelper'; // ⭐️ สมมติว่าสร้าง helper นี้เพื่อสร้าง headers
import { Platform } from 'react-native';
const getBackendHost = () => {
    // ใช้ API_URL ที่มาจาก config
    if (Platform.OS === 'android') return API_URL;
    return 'http://localhost:4000';
};

/**
 * ฟังก์ชันคืนหนังสือ
 * @param {string} borrowId - ID ของ record การยืมในตาราง borrows
 * @param {string} token - JWT Token
 */
export const returnBook = async (borrowId, token) => {
    if (!token) throw new Error("Authentication token is missing.");

    const backend = getBackendHost();
    const headers = generateAuthHeaders(token);
    
    // POST /api/borrows/return/:borrowId
    const res = await fetch(`${backend}/api/borrows/return/${borrowId}`, {
        method: 'POST',
        headers: headers,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.message || 'Failed to return book.');
    }
    
    return data;
};

/**
 * ฟังก์ชันยืมต่อหนังสือ
 * @param {string} borrowId - ID ของ record การยืมในตาราง borrows
 * @param {string} token - JWT Token
 */
export const extendBook = async (borrowId, token) => {
    if (!token) throw new Error("Authentication token is missing.");

    const backend = getBackendHost();
    const headers = generateAuthHeaders(token);

    // POST /api/borrows/renew/:borrowId
    const res = await fetch(`${backend}/api/borrows/renew/${borrowId}`, {
        method: 'POST',
        headers: headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Failed to extend book.');
    }

    return data;
};

// ⭐️ ต้องมี AuthHelper.js สำหรับการสร้าง headers ใน service
// เนื่องจาก Service Files ไม่ใช่ Component จึงใช้ useAuth() โดยตรงไม่ได้
// คุณจะต้องสร้างไฟล์นี้ขึ้นมาเอง
/* // ตัวอย่าง utils/AuthHelper.js:
    export const generateAuthHeaders = (token, contentType = 'application/json') => ({
        'Content-Type': contentType,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    });
*/