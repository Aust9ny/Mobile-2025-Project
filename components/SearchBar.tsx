// components/SearchBar.tsx
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  value: string;
  onChange: (t: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = 'Search by book or author...' }: Props) {
  const insets = useSafeAreaInsets(); // get device safe area

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#F8FCF8',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#D9D9D9'
  },
  input: {
    backgroundColor: '#D9D9D9',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#1E1E1E'
  }
});
