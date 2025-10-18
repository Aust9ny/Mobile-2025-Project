import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import BookInteractionModal from '../components/BookInteractionModal';
import LibraryService from '../services/LibraryService';
import styles from '../styles/ShelfScreenStyle';
import NoIcon from '../assets/healthicons_no.png';
import SearchIcon from '../assets/iconamoon_search-light.png';

type Props = {
  userId: string | null;
  shelfBooks: any[];
  isLoading: boolean;
  searchTerm: string;
  userProfile?: { photoURL?: string };
};

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function ShelfScreen({
  userId,
  shelfBooks,
  isLoading,
  searchTerm,
  userProfile,
}: Props) {
  const [active, setActive] = React.useState<any | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [searchText, setSearchText] = React.useState(searchTerm || '');

  // Filter books by search text
  const filtered = useMemo(() => {
    if (!searchText) return shelfBooks;
    const s = searchText.toLowerCase();
    return shelfBooks.filter(
      b =>
        (b.title ?? '').toLowerCase().includes(s) ||
        (b.author ?? '').toLowerCase().includes(s)
    );
  }, [shelfBooks, searchText]);

  const handleReturn = async (id: string) => {
    if (!userId) return;
    try {
      await LibraryService.returnBook(userId, id);
    } catch (e) {
      alert('Return failed.');
    } finally {
      setModalVisible(false);
    }
  };

  const handleExtend = async (id: string) => {
    if (!userId) return;
    try {
      await LibraryService.extendLoan(userId, id, 7);
    } catch (e) {
      alert('Extend failed.');
    } finally {
      setModalVisible(false);
    }
  };

  // Render each shelf book
  const renderItem = ({ item }: { item: any }) => {
    const daysLeft = Math.ceil(
      ((item.dueDate ?? new Date()).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
    );
    const isOverdue = daysLeft < 0;
    const statusLabel = isOverdue
      ? `OVERDUE by ${-daysLeft}d`
      : `${daysLeft} days left`;

    return (
      <Pressable
        onLongPress={() => {
          setActive(item);
          setModalVisible(true);
        }}
        style={styles.shelfItem}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.shelfTitle}>{item.title}</Text>
          <Text style={styles.shelfAuthor}>by {item.author}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            isOverdue
              ? styles.statusOverdue
              : daysLeft < 3
                ? styles.statusWarn
                : styles.statusOk,
          ]}
        >
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7fb' }}>
      {/* Header + Search Bar */}
      <View style={styles.customHeader}>
        {/* Title + Profile */}
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ชั้นหนังสือ</Text>
          <Image
            source={{ uri: userProfile?.photoURL || DEFAULT_PROFILE }}
            style={styles.profileImage}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Image
            source={SearchIcon}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="ชื่อหนังสือ หรือชื่อผู้แต่ง"
            placeholderTextColor="#386156"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>ขออภัย</Text>
          <Text style={styles.emptyText}>ท่านยังไม่มีหนังสือในชั้นหนังสือ</Text>
          <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>
            Your Borrowed Books ({filtered.length})
          </Text>
          <Text style={styles.tip}>Long-press a book to return or extend.</Text>

          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </>
      )}

      {/* Modal */}
      <BookInteractionModal
        visible={modalVisible}
        book={active}
        onClose={() => setModalVisible(false)}
        onReturn={handleReturn}
        onExtend={handleExtend}
      />
    </SafeAreaView>
  );
}
