import { StyleSheet, Dimensions } from 'react-native';
const screenWidth = Dimensions.get('window').width;

export const favoriteStyles = StyleSheet.create({
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

  // ---------- Grid Book Card ----------
  genreBookCard: {
    width: '31%',
    marginBottom: 12,
    marginRight: 8,
  },
  genreBookCover: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
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
