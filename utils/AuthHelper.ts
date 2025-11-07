export const generateAuthHeaders = (token : any, contentType = 'application/json') => {
    return {
        'Content-Type': contentType,
        // เพิ่ม Authorization header ถ้ามี token
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};