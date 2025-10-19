import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
export const cardWidth = (screenWidth - 48) / 3; // 3 cards per row + spacing

export const styles = StyleSheet.create({
  // ---------- Header ----------
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

  // ---------- Sub Tabs ----------
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

  // ---------- Home Tab Book Card (ขอบมนเล็ก แบบเดิม) ----------
  bookCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    padding: 6,
    elevation: 3,
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
    color: '#1E1E1E',
    marginTop: 6,
    textAlign: 'center',
  },
  author: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    marginTop: 2,
  },

  // ---------- Genre / Categories Book Card (ไม่มีขอบมน) ----------
  genreBookCard: {
    width: cardWidth,
    marginHorizontal: 4,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  genreBookCover: {
    width: '100%',
    height: cardWidth * 1.4,
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
    color: 'gray',
    marginTop: 2,
    textAlign: 'center',
  },

  // ---------- Genre / Categories / All Books ----------
  genreBookCardAll: {
    flex: 1,
    margin: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    alignItems: 'center',
  },
  genreBookCoverAll: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 4,
  },
  genreBookTitleAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1E1E',
    marginTop: 4,
    textAlign: 'center',
  },
  genreBookAuthorAll: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
    textAlign: 'center',
  },

  // ---------- Genre Header ----------
  genreSection: {
    marginVertical: 16,
    paddingHorizontal: 8,
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

  // ---------- Back Button ----------
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

  // ---------- Home Large Book Card (แถวละ 2 เล่ม) ----------
  homeBookCardLarge: {
    width: '48%', // 2 cards per row
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  homeBookCoverLarge: {
    width: '70%',
    aspectRatio: 0.7,
    borderRadius: 0, // ปกหนังสือไม่มน
    marginTop: 8,
  },
  homeBookTitleLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 4,
    textAlign: 'center',
  },
});
