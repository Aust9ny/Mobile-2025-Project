/**
 * ตรวจสอบว่าหนังสือสามารถยืมต่อได้หรือไม่
 * (Logic ตรงกับ API: ต้องมีสถานะ 'borrowed' หรือ 'renewed', 
 * ยังไม่เคยยืมต่อ, และเหลือเวลาน้อยกว่า 3 วัน)
 */
export const canExtend = (book: any) => {
  const isActiveBorrow = ['borrowed', 'renewed'].includes(book.status);
  if (!isActiveBorrow) return false;

  const dueDate = new Date(book.due_date || book.dueDate);
  const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // API logic: renewed_count ต้องเป็น 0 และ daysLeft <= 3 (และไม่ติดลบ)
  return (book.renewed_count === 0) && (daysLeft <= 3) && (daysLeft >= 0);
};

/**
 * จัดการข้อมูลหนังสือที่อาจมาจากหลายแหล่ง (เช่น title vs book_title)
 */
export const normalizeBookData = (item: any) => {
  return {
    id: item.id ?? item.book_id,
    title: item.title ?? item.book_title ?? 'ไม่มีชื่อเรื่อง',
    author: item.author ?? item.book_author ?? 'ไม่ทราบผู้แต่ง',
    cover: item.cover,
    borrowDate: new Date(item.borrow_date ?? item.borrowDate),
    dueDate: new Date(item.due_date ?? item.dueDate),
    status: item.status,
    renewed_count: item.renewed_count,
  };
};