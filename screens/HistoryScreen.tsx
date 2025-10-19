import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/HistoryScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png';
import NoIcon from '../assets/healthicons_no.png';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const screenWidth = Dimensions.get('window').width;

export default function HistoryScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      const stored = await AsyncStorage.getItem('viewHistory');
      if (stored) setHistory(JSON.parse(stored));
    };
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const filteredHistory = history.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderGridItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { width: screenWidth / 3 - 20, marginRight: (index + 1) % 3 === 0 ? 0 : 8 },
      ]}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Image source={{ uri: item.cover }} style={styles.cover} />
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {item.author}
      </Text>
      <Text style={styles.status} numberOfLines={1}>
        {item.viewedAt
          ? new Date(item.viewedAt).toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
      {/* Header */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ประวัติการเข้าชม</Text>

          {/* กดไปหน้า ProfileScreen */}
          <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
            <Image
              source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Image source={SearchIcon} style={styles.searchIcon} resizeMode="contain" />
          <TextInput
            style={styles.input}
            placeholder="ชื่อหนังสือ หรือชื่อผู้แต่ง"
            placeholderTextColor="#386156"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>


      {/* Grid Books */}
      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          renderItem={renderGridItem}
          columnWrapperStyle={{ paddingHorizontal: 8, marginTop: 16 }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>ท่านยังไม่มีประวัติการเข้าชม</Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
        </View>
      )}
    </View>
  );
}
