import { Platform } from 'react-native';
const API_URL = Platform.OS === 'ios' ? 'http://172.20.10.5:4000' : 'http://10.0.2.2:4000';
export default API_URL;