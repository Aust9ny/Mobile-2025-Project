import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
export const cardWidth = (screenWidth - 32) / 3; // 3 cards per row + margin

export default StyleSheet.create({
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

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 60,
    height: 60,
    marginTop: 16,
  },
  emptyText: {
    fontWeight: '600',
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
  },

  // ---------- Book Card for ShelfScreen ----------
  genreBookCard: {
    width: cardWidth,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  genreBookCover: {
    width: '100%',
    height: cardWidth * 1.4,
    marginVertical: 20
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
  borrowDateText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
    textAlign: 'center',
  },
  borrowStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  // ---------- Other ----------
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
    marginBottom: 8,
    marginLeft: 4,
  },
  tip: {
    color: '#5b5b8a',
    marginBottom: 12,
    marginLeft: 4,
  },
});
