import API_URL from '../config/apiConfig';

/**
 * คืนหนังสือ (POST /api/borrows/:bookId/return)
 */
export const returnBook = async (bookId: string, token: string | null) => {
  // ⭐️ FIX: ใช้ ${API_URL} และเพิ่ม /api
  const res = await fetch(`${API_URL}/api/borrows/${bookId}/return`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` || '',
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Return failed');
  }
  return data;
};

/**
 * ยืมหนังสือต่อ (POST /api/borrows/:bookId/extend)
 */
export const extendBook = async (bookId: string, token: string | null) => {
  // ⭐️ FIX: ใช้ ${API_URL} และเพิ่ม /api
  const res = await fetch(`${API_URL}/api/borrows/${bookId}/extend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` || '',
    },
    // ⭐️ FIX: ลบ body ที่ไม่จำเป็น (API เราคำนวณวันหมดอายุเอง)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Extend failed');
  }
  return data;
};