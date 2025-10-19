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

  // Header แบบเต็ม ไม่มีช่องว่างสีขาว
  header: {
    backgroundColor: '#115566',
    paddingVertical: 40,
    paddingHorizontal: 40,
    flexDirection: 'row',
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
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
});
