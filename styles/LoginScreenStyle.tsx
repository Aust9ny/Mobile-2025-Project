import { StyleSheet } from 'react-native';

// Color Palette
const COLORS = {
  primary: '#115566',    // Dark Teal
  secondary: '#386156',   // Medium Dark Green
  accent: '#B0BA1D',     // Lime Green
  background: '#F8FCF8', // Off-white
  textDark: '#1E1E1E',   // Almost Black
  textLight: '#FFFFFF',   // White
  placeholder: '#669886', // Medium Light Green
  border: '#D9D9D9',     // Gray
};

export const styles = StyleSheet.create({
  // --- Main Layout ---
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // 👈 Off-white BG
  },
  // Fixed Header
  header: {
    backgroundColor: COLORS.primary, // 👈 Dark Teal
    paddingTop: 60, // (เพิ่ม padding ด้านบนให้สูงขึ้น)
    paddingBottom: 40,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.accent, // 👈 Lime Green
  },
  
  // Scrolling Content Area
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },

  // --- Form Elements ---
  input: {
    backgroundColor: COLORS.textLight, // 👈 White
    borderWidth: 1,
    borderColor: COLORS.border, // 👈 Gray
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    color: COLORS.textDark, // 👈 Almost Black
    marginBottom: 15,
  },
  errorText: {
    color: '#D90429', // (Red)
    textAlign: 'center',
    marginBottom: 10,
  },

  // --- Buttons (ตามคำขอ) ---
  
  // ⭐️ 1. Main Button (สำหรับ Login/Register)
  button: {
    backgroundColor: COLORS.primary, // 👈 Dark Teal
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: COLORS.textLight, // 👈 White
    fontSize: 16,
    fontWeight: '700',
  },

  // ⭐️ 2. Text Button (สำหรับ "สลับหน้า" หรือ "ลืมรหัส")
  textButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  textButtonText: {
    color: COLORS.secondary, // 👈 Medium Dark Green
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});