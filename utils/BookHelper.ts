/**
 * แปลงข้อมูลหนังสือที่ยืมมา (จาก API) ให้เป็นรูปแบบที่ Component ใช้งานง่าย
 * และแปลง Date String ให้เป็น Date Object
 * @param {object} item - ข้อมูลหนังสือที่ยืมมาจาก GET /api/borrows/current
 * @returns {object} ข้อมูลหนังสือที่ normalize แล้ว
 */
export const normalizeBookData = (item : any) => {
    // ⭐️ ใช้ item.id หรือ item.book_id เป็น ID หลัก
    const id = item.id || item.book_id; 

    return {
        // IDs
        id: id,
        borrowId: item.borrow_id, // ID ของ Record ในตาราง Borrows

        // Core Book Data
        title: item.title,
        author: item.author,
        cover: item.cover,
        
        // Borrow Status/Dates
        status: item.status, // borrowed, renewed, overdue, returned
        renewCount: item.renew_count || 0,
        
        // ⭐️ แปลง String เป็น Date Object (สำคัญสำหรับ Frontend Logic)
        borrowDate: item.borrow_date ? new Date(item.borrow_date) : null,
        dueDate: item.due_date ? new Date(item.due_date) : null,
        returnDate: item.return_date ? new Date(item.return_date) : null,
    };
};

/**
 * ตรวจสอบว่าสามารถยืมต่อหนังสือได้หรือไม่
 * เงื่อนไข: 1. ต้องยังไม่เคยยืมต่อ (renew_count = 0) 2. เหลือเวลา 3 วัน หรือเกินกำหนด
 * @param {object} book - ข้อมูลหนังสือที่ normalize แล้ว
 * @returns {boolean}
 */
export const canExtend = (book : any) => {
    // ต้องมี due_date และ status ต้องเป็น active borrow
    if (!book.dueDate || book.status === 'returned') return false; 
    
    // 1. ตรวจสอบว่าเคยยืมต่อแล้วหรือไม่
    if (book.status === 'renewed' || book.renewCount > 0) return false;

    const dueDate = book.dueDate;
    const now = new Date();
    // Math.ceil เพื่อให้ได้จำนวนวันเต็ม (สำคัญมากในการคำนวณวันคงเหลือ)
    const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // 2. เงื่อนไขการยืมต่อ: เหลือ 3 วัน หรือ เกินกำหนด (daysLeft < 0)
    return daysLeft <= 3;
};