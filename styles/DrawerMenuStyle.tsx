import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const drawerWidth = width * 0.75;

export const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  drawer: {
    width: drawerWidth,
    height: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    padding: 30,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#115566',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuText: {
    fontSize: 18,
    color: '#1E1E1E',
    marginLeft: 12,
    fontWeight: '600',
    marginRight: 15
  },
  logout: {
    marginTop: 20,
  },
});
