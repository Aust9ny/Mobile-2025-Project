// ShelfScreen placeholder
// screens/ShelfScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import BookInteractionModal from '../components/BookInteractionModal';
import LibraryService from '../services/LibraryService';

type Props = {
  userId: string | null;
  shelfBooks: any[];
  isLoading: boolean;
  searchTerm: string;
};

export default function ShelfScreen({ userId, shelfBooks, isLoading, searchTerm }: Props) {
  const [active, setActive] = React.useState<any | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const filtered = useMemo(() => {
    if (!searchTerm) return shelfBooks;
    const s = searchTerm.toLowerCase();
    return shelfBooks.filter(b => (b.title ?? '').toLowerCase().includes(s) || (b.author ?? '').toLowerCase().includes(s));
  }, [shelfBooks, searchTerm]);

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
      // extend by 7 days
      await LibraryService.extendLoan(userId, id, 7);
    } catch (e) {
      alert('Extend failed.');
    } finally {
      setModalVisible(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}><ActivityIndicator size="small" /></View>
    );
  }

  if (!filtered.length) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 22 }}>📚</Text>
        <Text style={{ fontWeight: '600', marginTop: 8 }}>Your shelf is empty!</Text>
        <Text style={{ color: '#666', marginTop: 4 }}>Borrow a book from Library.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const daysLeft = Math.ceil(((item.dueDate ?? new Date()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;
    const statusLabel = isOverdue ? `OVERDUE by ${-daysLeft}d` : `${daysLeft} days left`;

    return (
      <Pressable onLongPress={() => { setActive(item); setModalVisible(true); }} style={styles.shelfItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.shelfTitle}>{item.title}</Text>
          <Text style={styles.shelfAuthor}>by {item.author}</Text>
        </View>
        <View style={[styles.statusPill, isOverdue ? styles.statusOverdue : daysLeft < 3 ? styles.statusWarn : styles.statusOk]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Borrowed Books ({filtered.length})</Text>
      <Text style={styles.tip}>Long-press a book to return or extend.</Text>

      <FlatList data={filtered} keyExtractor={(i) => i.id} renderItem={renderItem} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} contentContainerStyle={{ paddingBottom: 120 }} />

      <BookInteractionModal
        visible={modalVisible}
        book={active}
        onClose={() => setModalVisible(false)}
        onReturn={handleReturn}
        onExtend={handleExtend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { flex: 1, padding: 12, backgroundColor: '#f7f7fb' },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#222', marginBottom: 8 },
  tip: { color: '#5b5b8a', marginBottom: 12 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  shelfItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 10, alignItems: 'center' },
  shelfTitle: { fontWeight: '700' },
  shelfAuthor: { color: '#666', fontSize: 12, marginTop: 4 },
  statusPill: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8 },
  statusOk: { backgroundColor: '#10b981' },
  statusWarn: { backgroundColor: '#f59e0b' },
  statusOverdue: { backgroundColor: '#ef4444' },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 12 }
});
