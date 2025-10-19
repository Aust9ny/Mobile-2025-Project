import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/HistoryScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png';
import NoIcon from '../assets/healthicons_no.png';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function HistoryScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  // โหลดประวัติจาก AsyncStorage
  useEffect(() => {
    const loadHistory = async () => {
      const stored = await AsyncStorage.getItem('borrowHistory');
      if (stored) setHistory(JSON.parse(stored));
    };
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const filteredHistory = history.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => {
    // คำนวณสถานะยืม (ตัวอย่าง)
    const today = new Date();
    const dueDate = new Date(item.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const status =
      diffDays > 0
        ? `เหลือเวลาอีก ${diffDays} วัน`
        : 'สิ้นสุดการยืม';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BookDetail', { book: item })}
      >
        <Image source={{ uri: item.cover }} style={styles.cover} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.genre}>{item.genre}</Text>
          <Text style={styles.status}>{status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
      {/* 🔹 Header */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ประวัติการอ่าน</Text>
          <Image
            source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }}
            style={styles.profileImage}
          />
        </View>

        {/* 🔹 Search Bar */}
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

      {/* 🔹 แสดงประวัติ */}
      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>ขออภัย</Text>
          <Text style={styles.emptyText}>ท่านยังไม่มีประวัติการอ่าน</Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
        </View>
      )}
    </View>
  );
}
