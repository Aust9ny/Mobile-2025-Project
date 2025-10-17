// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useAuth from './hooks/useAuth';
import useShelfBooks from './hooks/useShelfBooks';
import SearchBar from './components/SearchBar';
import LibraryScreen from './screens/LibraryScreen';
import ShelfScreen from './screens/ShelfScreen';
import MenuScreen from './screens/MenuScreen';
import BookDetailScreen from './screens/BookDetailScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SearchScreen from './screens/SearchScreen';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function LibraryStack({ userId, shelfBooks }: any) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LibraryHome"
        options={({ navigation }: any) => ({
          title: 'ห้องสมุด',
          headerStyle: { backgroundColor: '#115566' },
          headerTintColor: '#F8FCF8',
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('Search')} style={{ marginRight: 16 }}>
              <Text style={{ color: '#B0BA1D', fontWeight: '700' }}>ค้นหา</Text>
            </Pressable>
          )
        })}
      >
        {(props: any) => <LibraryScreen {...props} userId={userId} shelfBooks={shelfBooks} />}
      </Stack.Screen>

      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ title: 'รายละเอียดหนังสือ', headerTintColor: '#F8FCF8', headerStyle: { backgroundColor: '#115566' } }}
      />

      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}



export default function App() {
  const { userId, isAuthReady } = useAuth();
  const { shelfBooks, isLoading } = useShelfBooks(userId, isAuthReady);
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
                tabBarStyle: { height: 64, paddingBottom: 8 },
                tabBarLabelStyle: { fontSize: 12, fontWeight: '700' }
              }}
            >
              <Tab.Screen name="Library">
                {() => <LibraryStack userId={userId} shelfBooks={shelfBooks} />}
              </Tab.Screen>
              <Tab.Screen name="MyShelf">
                {() => <ShelfScreen userId={userId} shelfBooks={shelfBooks} isLoading={isLoading} searchTerm={searchTerm} />}
              </Tab.Screen>
              <Tab.Screen name="Menu" component={MenuScreen} />
            </Tab.Navigator>
          </View>
          <View style={styles.userBox}>
            <Text style={{ fontSize: 11, color: '#666' }}>User ID: {userId ?? '—'}</Text>
          </View>
        </SafeAreaView>
      </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7fb' },
  container: { flex: 1 },
  userBox: { position: 'absolute', left: 8, bottom: 72, backgroundColor: '#fff', padding: 6, borderRadius: 8, elevation: 2 }
});
