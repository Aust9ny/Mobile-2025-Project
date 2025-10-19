import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    width: '100%',
    backgroundColor: '#115566',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  headerTitle: {
    color: '#B0BA1D',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },

  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },

  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center', 
    width: '100%',
    marginVertical: 20
  },

  row: {
    alignItems: 'center',
    marginBottom: 15,
  },

  icon: {
    width: 50,
    height: 50,
    marginBottom: 20,
    marginTop: 20,
    resizeMode: 'contain',
  },

  text: {
    color: '#1E1E1E',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
  },

  openText: {
    color: '#115566',
    fontWeight: '700',
  },

  closeText: {
    color: 'red',
    fontWeight: '700',
  },

  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    flexWrap: 'wrap',
    marginBottom: 20,
  },

  socialItem: {
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 10,
  },

  socialIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  socialText: {
    fontSize: 13,
    color: '#1E1E1E',
    textAlign: 'center',
    marginTop: 5,
  },

  backButton: {
    backgroundColor: '#115566',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 40,
    width: '90%',
    alignItems: 'center',
    marginBottom: 40
  },

  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
