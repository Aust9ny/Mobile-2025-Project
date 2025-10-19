import React, { useState, createContext, useContext } from 'react';
import { SafeAreaView, View, TouchableOpacity, Image, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import useAuth from './hooks/useAuth';
import useShelfBooks from './hooks/useShelfBooks';

import LibraryScreenStack from './screens/LibraryScreen';
import ShelfScreen from './screens/ShelfScreen';
import SearchScreen from './screens/SearchScreen';
import DrawerMenu from './components/DrawerMenu';

import libraryActive from './assets/hugeicons_bookshelf-03-color.png';
import libraryInactive from './assets/hugeicons_bookshelf-03.png';
import MyShelfInactive from './assets/hugeicons_book-open-02.png';
import MyShelfActive from './assets/hugeicons_book-open-02-color.png';
import SearchInActive from './assets/iconamoon_search-light.png';
import SearchActive from './assets/iconamoon_search-light-color.png';
import MenuInactive from './assets/charm_menu-hamburger.png';
import MenuActive from './assets/charm_menu-hamburger-color.png';

// Context สำหรับ Drawer
type DrawerContextType = {
  toggleDrawer: () => void;
  drawerVisible: boolean;
};
const DrawerContext = createContext<DrawerContextType>({
  toggleDrawer: () => {},
  drawerVisible: false,
});
export const useDrawer = () => useContext(DrawerContext);

const Tab = createBottomTabNavigator();

export default function App() {
  const { userId, isAuthReady, userProfile } = useAuth();
  const { shelfBooks, isLoading } = useShelfBooks(userId, isAuthReady);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const toggleDrawer = () => setDrawerVisible((prev) => !prev);
  const closeDrawer = () => setDrawerVisible(false);

  // Custom Tab Bar
  const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const { toggleDrawer, drawerVisible } = useDrawer();

    return (
      <View style={{ flexDirection: 'row', height: 75, paddingBottom: 8, backgroundColor: '#fff' }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          if (route.name === 'Menu') {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={toggleDrawer} // toggle Drawer ผ่าน Context
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <Image
                  source={drawerVisible ? MenuActive : MenuInactive}
                  style={{ width: 28, height: 28 }}
                />
                <Text style={{ color: '#999999', fontSize: 12, marginTop: 4 }}>เมนู</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? '#115566' : '#999999',
                size: 28,
              })}
              <Text
                style={{
                  color: isFocused ? '#115566' : '#999999',
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {options.tabBarLabel ?? route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DrawerContext.Provider value={{ toggleDrawer, drawerVisible }}>
          <NavigationContainer>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7fb' }}>
              <Tab.Navigator
                screenOptions={{ headerShown: false }}
                tabBar={(props) => <CustomTabBar {...props} />}
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

                {/* Route สำหรับ Menu */}
                <Tab.Screen
                  name="Menu"
                  component={() => null} // ไม่แสดงอะไร
                />
              </Tab.Navigator>

              {/* DrawerMenu Overlay */}
              <DrawerMenu
                visible={drawerVisible}
                onClose={closeDrawer}
                userProfile={userProfile}
              />
            </SafeAreaView>
          </NavigationContainer>
        </DrawerContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
