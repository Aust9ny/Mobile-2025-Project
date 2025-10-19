import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/FavoriteScreenStyle';
import SearchIcon from '../assets/iconamoon_search-light.png';
import NoIcon from '../assets/healthicons_no.png';

const DEFAULT_PROFILE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function FavoriteScreen({ userProfile }: { userProfile?: { photoURL?: string } }) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const loadFavorites = async () => {
            const stored = await AsyncStorage.getItem('favoriteBooks');
            if (stored) setFavorites(JSON.parse(stored));
        };
        const unsubscribe = navigation.addListener('focus', loadFavorites);
        return unsubscribe;
    }, [navigation]);

    const filteredBooks = favorites.filter(book =>
        book.title.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FCF8' }}>
            {/* 🔹 Header เหมือน SearchScreen */}
            <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>รายการโปรด</Text>
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
                        placeholder="ค้นหารายการโปรด..."
                        placeholderTextColor="#386156"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            </View>

            {/* 🔹 รายการหนังสือที่กด Favorite */}
            {filteredBooks.length > 0 ? (
                <FlatList
                    data={filteredBooks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('BookDetail', { book: item })}
                        >
                            <Image source={{ uri: item.cover }} style={styles.cover} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.author}>{item.author}</Text>
                                <Text style={styles.genre}>{item.genre}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            ) : (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>ขออภัย</Text>
                    <Text style={styles.emptyText}>ท่านยังไม่ได้เพิ่มรายการโปรด</Text>
                    <Image source={NoIcon} style={[styles.emptyIcon, { tintColor: 'red' }]} />
                </View>
            )}

        </View>
    );
}
