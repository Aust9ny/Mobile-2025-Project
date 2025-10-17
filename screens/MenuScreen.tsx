// MenuScreen placeholder
// screens/MenuScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen() {
  return (
    <SafeAreaProvider>
    <SafeAreaView></SafeAreaView>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings & Profile</Text>
      <View style={styles.blank}>
        <Text style={{ color: '#666' }}>Add settings, account, or app preferences here.</Text>
        <Text style={{ fontSize: 36, marginTop: 12 }}>⚙️</Text>
      </View>
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  section: { flex: 1, padding: 12, backgroundColor: '#f7f7fb' },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#222', marginBottom: 8 },
  blank: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center' }
});
