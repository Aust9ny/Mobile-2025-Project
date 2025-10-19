import { StyleSheet, Dimensions } from 'react-native';
const screenWidth = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  // ---------- Header ----------
  customHeader: {
    backgroundColor: '#115566',
    width: '100%',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#B0BA1D',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 20,
  },
  searchIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E1E1E',
  },

  // ---------- ผลการค้นหา ----------
  searchResultHeader: {
    color: '#115566',
    fontSize: 30,
    fontWeight: '800',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 16,
  },

  // ---------- หนังสือเล่มแรกใหญ่ ----------
  searchFirstBookContainer: {
    marginBottom: 24,
    paddingLeft: 16, // ชิดซ้าย
  },
  searchFirstBookCover: {
    width: screenWidth * 0.65, // เกือบเต็มหน้าจอด้านซ้าย
    height: screenWidth * 0.95, // ความสูงตาม aspect ratio ปก
  },
  searchFirstBookTitle: {
    color: '#1E1E1E',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  searchFirstBookAuthor: {
    color: '#666666',
    fontSize: 14,
    marginTop: 4,
  },

  // ---------- Grid Book Card (เหมือนหมวดหมู่) ----------
  genreBookCard: {
    width: '31%',
    marginBottom: 12,
    marginRight: 8,
  },
  genreBookCover: {
    width: '100%',
    aspectRatio: 0.7,
  },
  genreBookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1E1E',
    marginTop: 4,
    textAlign: 'center',
  },
  genreBookAuthor: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    textAlign: 'center',
  },

  // ---------- ไม่มีผลลัพธ์ ----------
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#1E1E1E',
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginTop: 10,
    tintColor: 'red',
  },
});
