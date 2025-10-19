import React from 'react';
import { View, TextInput, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchIcon from '../assets/iconamoon_search-light.png'; // ✅ ใช้ icon เดิม

type Props = {
  value: string;
  onChange: (t: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = 'ชื่อหนังสือ หรือชื่อผู้แต่ง',
}: Props) {
  const insets = useSafeAreaInsets(); // ป้องกันชน notch ของอุปกรณ์

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.container}>
        <Image source={SearchIcon} style={styles.icon} resizeMode="contain" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#386156"
          value={value}
          onChangeText={onChange}
          returnKeyType="search"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: '#386156',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E1E1E',
  },
});
