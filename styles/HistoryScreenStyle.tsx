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

  // ---------- Search Bar ----------
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

  // ---------- Grid Book Card (ไม่มี background สีขาว) ----------
  card: {
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 4, // spacing ระหว่าง card
  },
  cover: {
    width: '100%',
    aspectRatio: 0.7,
  },
  title: {
    fontWeight: '700',
    color: '#115566',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  author: {
    color: '#386156',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  status: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center', // กึ่งกลาง
  },

  // ---------- Empty / No Data ----------
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
