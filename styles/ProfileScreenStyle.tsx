import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'space-between', // profile+input อยู่กลาง ปุ่มอยู่ล่าง
    alignItems: 'center',
    paddingVertical: 0, // ลบช่องว่างด้านบน/ล่าง
    width: '100%',
  },

  // Header (FIXED: เพิ่ม 'row' และ 'space-between' เพื่อรองรับปุ่ม 'แก้ไข')
  header: {
    backgroundColor: '#115566',
    paddingVertical: 40,
    paddingHorizontal: 40,
    flexDirection: 'row', // 👈 1. เปลี่ยนเป็น row
    justifyContent: 'space-between', // 👈 2. เพิ่ม
    alignItems: 'center', // 👈 3. เพิ่ม
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#B0BA1D',
  },
  // ⭐️ NEW: สไตล์สำหรับปุ่ม "แก้ไข" / "บันทึก"
  editButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0BA1D',
  },

  // กล่องกลาง
  centerContent: {
    alignItems: 'center',
    width: '100%',
  },

  profileImageContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    marginBottom: 30,
  },

  inputContainer: {
    width: '90%',
    alignItems: 'center',
  },
  inputField: {
    backgroundColor: 'rgba(102, 152, 134,0.2)',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#115566',
    marginBottom: 20,
    width: '100%',
  },
  // ⭐️ NEW: สไตล์สำหรับช่อง Input ที่ "กำลังแก้ไข"
  inputFieldEditing: {
    backgroundColor: 'rgba(102, 152, 134, 0.5)', // สีเข้มขึ้น
    borderColor: '#115566',
    borderWidth: 1,
  },
  switchLabel: {
    color: 'gray',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'right', // ชิดขวา
    marginTop: 0,
    marginBottom: 20,
    width: '100%', // กินพื้นที่เต็ม input
  },

  bottomButtons: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  logoutText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  logoutIcon: {
    width: 24,
    height: 24,
  },
  
  // ⭐️ NEW: Loading indicator
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  }
});