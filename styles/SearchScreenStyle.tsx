import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  cover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
  },
  title: {
    fontWeight: '700',
    color: '#115566',
    fontSize: 16,
  },
  author: {
    color: '#386156',
    marginTop: 2,
  },
  genre: {
    color: '#669886',
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#1E1E1E',
    marginTop: 40,
    fontSize: 16,
  },
});
