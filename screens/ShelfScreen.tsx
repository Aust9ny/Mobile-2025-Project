import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BookInteractionModal from '../components/BookInteractionModal';
import SearchBar from '../components/SearchBar';
import NoIcon from '../assets/healthicons_no.png';
import styles, { cardWidth } from '../styles/ShelfScreenStyle';

type Props = {
  userProfile?: { photoURL?: string };
  isLoading?: boolean;
  shelfBooks?: any[];
  token?: string | null;
  onRefresh?: () => void;
};

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

import { API_URL } from '../services/config';

export default function ShelfScreen({ userProfile, isLoading = false, shelfBooks = [], token, onRefresh }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [list, setList] = useState<any[]>(shelfBooks);
  const [searchText, setSearchText] = useState('');
  const [active, setActive] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Sync with props
  useFocusEffect(
    useCallback(() => {
      setList(shelfBooks);
    }, [shelfBooks])
  );

  // 🧩 helper function: fetch JSON safely
  const safeFetchJSON = async (url: string, options: any) => {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return { ok: res.ok, data };
    } catch (err) {
      console.error('⚠️ ไม่สามารถ parse JSON ได้:', text);
      return { ok: false, data: { error: 'Response ไม่ใช่ JSON' } };
    }
  };

  // ✅ คืนหนังสือ
  const handleReturn = async (bookId: string) => {
    const book = borrowHistory.find((b) => b.id === bookId);
    if (!book) return;

    try {
      const res = await fetch(`${API_URL}/borrows/${id}/return`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` || '' },
      });
      if (!res.ok) throw new Error('Return failed');
      setModalVisible(false);
      onRefresh?.();
    } catch (e) {
      console.error(e);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  // ✅ ยืมต่อ
  const handleExtend = async (bookId: string) => {
    const book = borrowHistory.find((b) => b.id === bookId);
    if (!book) return;

    try {
      const target = list.find(b => b.id === id);
      if (!target || !canExtend(target)) {
        alert('ไม่สามารถยืมต่อได้แล้ว');
        return;
      }
      const newDue = new Date(target.due_date || target.dueDate || new Date());
      newDue.setDate(newDue.getDate() + 7);
      const res = await fetch(`${API_URL}/borrows/${id}/extend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` || '',
        },
        body: JSON.stringify({ new_due_date: newDue.toISOString() })
      });
      if (!res.ok) throw new Error('Extend failed');
      setModalVisible(false);
      onRefresh?.();
    } catch (e) {
      console.error(e);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  const filtered = useMemo(() => {
    if (!searchText) return list;
    const s = searchText.toLowerCase();
    return list.filter(
      (b) =>
        ((b.title ?? b.book_title ?? '') as string).toLowerCase().includes(s) ||
        ((b.author ?? b.book_author ?? '') as string).toLowerCase().includes(s)
    );
  }, [list, searchText]);

  const renderItem = ({ item }: { item: any }) => {
    const borrowDate = new Date(item.borrow_date ?? item.borrowDate);
    const dueDate = new Date(item.due_date ?? item.dueDate);
    const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;
    const canExtend = !item.extended && daysLeft <= 3;

    return (
      <Pressable
        onPress={() => {
          setActive(item);
          setModalVisible(true);
        }}
        style={{ width: cardWidth, margin: 4 }}
      >
        {item.cover ? (
          <Image source={{ uri: item.cover }} style={styles.genreBookCover} />
        ) : (
          <View
            style={[
              styles.genreBookCover,
              { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            <Text style={{ fontSize: 12, color: '#666' }}>No Cover</Text>
          </View>
        )}
        <Text style={styles.genreBookTitle}>{item.title ?? item.book_title ?? ''}</Text>
        <Text style={styles.genreBookAuthor}>{item.author ?? item.book_author ?? ''}</Text>

        <Text style={{ fontSize: 12, color: 'gray', marginTop: 2 }}>
          ยืมวันที่: {borrowDate.toLocaleDateString('th-TH')}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: isOverdue ? 'red' : 'green',
            marginTop: 2,
            fontWeight: '600',
          }}
        >
          {isOverdue
            ? `⚠️ เกินกำหนดคืนแล้ว ${Math.abs(daysLeft)} วัน`
            : `📅 เหลือเวลาอีก ${daysLeft} วัน`}
        </Text>
        {canExtend && (
          <Text style={{ fontSize: 12, color: 'blue', marginTop: 2 }}>
            💡 ยืมต่อได้อีก 7 วัน
          </Text>
        )}
        {item.extended && (
          <Text style={{ fontSize: 11, color: 'orange', marginTop: 2 }}>
            ✓ ยืมต่อแล้ว
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7fb' }}>
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ชั้นหนังสือ</Text>
          <Pressable onPress={() => navigation.navigate('ProfileScreen' as never)}>
            <Image
              source={{ uri: userProfile?.photoURL ?? DEFAULT_PROFILE }}
              style={styles.profileImage}
            />
          </Pressable>
        </View>
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="ชื่อหนังสือ หรือชื่อผู้แต่ง"
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>ขออภัย</Text>
          <Text style={styles.emptyText}>ท่านยังไม่มีหนังสือที่ยืม</Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => (i.id ?? i.book_id ?? Math.random()).toString()}
          renderItem={renderItem}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 4 }}
        />
      )}

      <BookInteractionModal
        visible={modalVisible}
        book={active}
        onClose={() => setModalVisible(false)}
        onReturn={async (id: string) => {
          await handleReturn(id);
          setModalVisible(false);
        }}
        onExtend={async (id: string) => {
          await handleExtend(id);
          setModalVisible(false);
        }}
        canExtend={
          active
            ? (() => {
                const dueDate = new Date(active.dueDate);
                const daysLeft = Math.ceil(
                  (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return !active.extended && daysLeft <= 3;
              })()
            : false
        }
      />
    </View>
  );
}
