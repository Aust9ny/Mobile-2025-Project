import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'flex-start',
  },

  // Header แบบเดียวกับ ShelfScreen
  header: {
    backgroundColor: '#115566',
    paddingVertical: 40,
    paddingHorizontal: 40,
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#B0BA1D',
  },

  // โปรไฟล์
  profileImageContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
  },

  // ช่องกรอกข้อมูล
  inputContainer: {
    marginTop: 40,
    paddingHorizontal: 40,
  },
  inputField: {
    backgroundColor: 'rgba(102, 152, 134,0.2)',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#115566',
    marginBottom: 20,
  },

  // Label "เปลี่ยนบัญชี" อยู่ใต้ช่องนามสกุล ชิดขวา
  switchLabel: {
    color: 'gray',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'right',
    marginTop: 0, 
    marginBottom: 20,
  },

  // ปุ่มด้านล่างสุด
  bottomButtons: {
    marginTop: 'auto',
    alignItems: 'center',
    marginBottom: 20,
  },

  // ปุ่มออกจากระบบ
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginBottom: 10,
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

  // ปุ่มย้อนกลับ
  backButton: {
    backgroundColor: '#115566',
    borderRadius: 50,
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginBottom: 10,
    width: 500
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
