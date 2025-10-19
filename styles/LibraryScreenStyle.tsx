import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // 🔹 Header (ปรับขนาด / padding / spacing / profile)
  customHeader: {
    backgroundColor: '#115566',
    width: '100%',
    paddingHorizontal: 40,
    paddingVertical: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
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
  menuIcon: {
    width: 28,
    height: 28,
    position: 'absolute',
    right: 16,
    top: 40,
  },

  // 🔹 Tabs ด้านล่าง header
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#115566',
  },
  subTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 0,
  },
  subTabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subTabActiveText: {
    fontWeight: '800',
  },
  subTabIndicator: {
    height: 3,
    backgroundColor: '#fff',
    width: '100%',
    marginTop: 5,
    borderRadius: 2,
  },

  // 🔹 เนื้อหา FlatList
  flatListContent: {
    paddingTop: 20,
    paddingBottom: 120,
    paddingHorizontal: 8,
  },

  // 🔹 หมวดหมู่หนังสือ
  genreSection: {
    marginTop: 20,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  genreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  genreTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#115566',
  },
  seeAllText: {
    color: '#B0BA1D',
    fontWeight: '600',
    fontSize: 16,
  },

  // 🔹 การ์ดหนังสือ
  bookCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    elevation: 3,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cover: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },

  // 🔹 รายการหมวดหมู่ในแท็บ "หมวดหมู่"
  categoryItem: {
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 12,
    paddingLeft: 16,
    color: '#115566',
  },

  // 🔹 หน้า “ดูทั้งหมด”
  genreBooksContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    marginLeft: 20,
  },
  backButtonArrow: {
    fontSize: 22,
    color: '#115566',
    marginRight: 6,
  },
  backButtonText: {
    fontSize: 18,
    color: '#115566',
    fontWeight: '700',
  },

  // 🔹 การ์ดหนังสือใน GenreBooksScreen
  genreBookCard: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  genreBookCover: {
    width: 90,
    height: 140,
    borderRadius: 10,
  },
  genreBookInfo: {
    marginLeft: 16,
    flex: 1,
  },
  genreBookTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#115566',
  },
  genreBookAuthor: {
    color: '#666',
    marginTop: 4,
  },
});
