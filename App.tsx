import React from 'react';
import { SafeAreaView, View, Text, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import useAuth from './hooks/useAuth';
import useShelfBooks from './hooks/useShelfBooks';

import LibraryScreenStack from './screens/LibraryScreen';
import ShelfScreen from './screens/ShelfScreen';
import MenuScreen from './screens/MenuScreen';
import SearchScreen from './screens/SearchScreen';

import libraryActive from './assets/hugeicons_bookshelf-03-color.png';
import libraryInactive from './assets/hugeicons_bookshelf-03.png';
import MyShelfInactive from './assets/hugeicons_book-open-02 (1).png';
import MyShelfActive from './assets/hugeicons_book-open-02-color.png';
import SearchInActive from './assets/iconamoon_search-light.png';
import SearchActive from './assets/iconamoon_search-light-color.png';
import MenuActive from './assets/charm_menu-hamburger-color.png';
import MenuInactive from './assets/charm_menu-hamburger.png';

const Tab = createBottomTabNavigator();

export default function App() {
  const { userId, isAuthReady, userProfile } = useAuth();
  const { shelfBooks, isLoading } = useShelfBooks(userId, isAuthReady);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7fb' }}>
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
                tabBarStyle: { height: 75, paddingBottom: 8 },
                tabBarLabelStyle: { fontSize: 14, fontWeight: '700' },
                tabBarActiveTintColor: '#115566',
                tabBarInactiveTintColor: '#999999',
              }}
            >
              <Tab.Screen
                name="Library"
                options={{
                  tabBarLabel: 'ห้องสมุด',
                  tabBarIcon: ({ focused }) => (
                    <Image
                      source={focused ? libraryActive : libraryInactive}
                      style={{ width: 28, height: 28 }}
                    />
                  ),
                }}
              >
                {() => (
                  <LibraryScreenStack
                    userId={userId}
                    shelfBooks={shelfBooks}
                    userProfile={userProfile}
                  />
                )}
              </Tab.Screen>

              <Tab.Screen
                name="MyShelf"
                options={{
                  tabBarLabel: 'ชั้นหนังสือ',
                  tabBarIcon: ({ focused }) => (
                    <Image
                      source={focused ? MyShelfActive : MyShelfInactive}
                      style={{ width: 28, height: 28 }}
                    />
                  ),
                }}
              >
                {() => (
                  <ShelfScreen
                    userId={userId}
                    shelfBooks={shelfBooks}
                    isLoading={isLoading}
                  />
                )}
              </Tab.Screen>

              <Tab.Screen
                name="Search"
                options={{
                  tabBarLabel: 'ค้นหา',
                  tabBarIcon: ({ focused }) => (
                    <Image
                      source={focused ? SearchActive : SearchInActive}
                      style={{ width: 28, height: 28 }}
                    />
                  ),
                }}
              >
                {() => <SearchScreen />}
              </Tab.Screen>

              <Tab.Screen
                name="Menu"
                options={{
                  tabBarLabel: 'Menu',
                  tabBarIcon: ({ focused }) => (
                    <Image
                      source={focused ? MenuActive : MenuInactive}
                      style={{ width: 28, height: 28 }}
                    />
                  ),
                }}
                component={MenuScreen}
              />
            </Tab.Navigator>
          </SafeAreaView>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
