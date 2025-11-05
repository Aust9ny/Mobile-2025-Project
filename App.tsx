import React, { useState, createContext, useContext } from "react";
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

import useAuth from "./hooks/useAuth";
import useShelfBooks from "./hooks/useShelfBooks";

import LibraryScreenStack from "./screens/LibraryScreen";
import ShelfScreen from "./screens/ShelfScreen";
import SearchScreen from "./screens/SearchScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ContactScreen from "./screens/ContactScreen";
import FavoriteScreen from "./screens/FavoriteScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";

import DrawerMenu from "./components/DrawerMenu";

import libraryActive from "./assets/hugeicons_bookshelf-03-color.png";
import libraryInactive from "./assets/hugeicons_bookshelf-03.png";
import MyShelfInactive from "./assets/hugeicons_book-open-02.png";
import MyShelfActive from "./assets/hugeicons_book-open-02-color.png";
import SearchInActive from "./assets/iconamoon_search-light.png";
import SearchActive from "./assets/iconamoon_search-light-color.png";
import MenuInactive from "./assets/charm_menu-hamburger.png";
import MenuActive from "./assets/charm_menu-hamburger-color.png";

// initialize firebase client (no admin/service-account here)
import "./services/firebase";

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

// MenuStack เป็น Tab สำหรับหน้า Profile/Contact/Favorite/History
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const MenuStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import RegisterOtpScreen from "./screens/RegisterOtpScreen";

function MenuStackScreen() {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="Login" component={LoginScreen} />
      <MenuStack.Screen name="Register" component={RegisterScreen} />
      <MenuStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <MenuStack.Screen name="ContactScreen" component={ContactScreen} />
      <MenuStack.Screen name="FavoriteScreen" component={FavoriteScreen} />
      <MenuStack.Screen name="HistoryScreen" component={HistoryScreen} />
    </MenuStack.Navigator>
  );
}

export default function App() {
  // include logout from useAuth (implement in hook if missing)
  const { userId, token, isAuthReady, logout } = useAuth();
  const { shelfBooks, isLoading, refreshBooks } = useShelfBooks(
    userId,
    token,
    isAuthReady
  );
  const userProfile = { photoURL: undefined as string | undefined };

  const [drawerVisible, setDrawerVisible] = useState(false);
  const toggleDrawer = () => setDrawerVisible((prev) => !prev);
  const closeDrawer = () => setDrawerVisible(false);

  // Custom Tab Bar
  const CustomTabBar = ({
    state,
    descriptors,
    navigation,
  }: BottomTabBarProps) => {
    const { toggleDrawer, drawerVisible } = useDrawer();

    return (
      <View
        style={{
          flexDirection: "row",
          height: 75,
          paddingBottom: 8,
          backgroundColor: "#fff",
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          let isFocused = state.index === index;

          // ตรวจสอบ LibraryStack
          if (route.name === "Library") {
            isFocused = state.routes[state.index].name === "Library";
          }

          if (route.name === "Menu") {
            const menuTabIndex = state.routes.findIndex(
              (r) => r.name === "Menu"
            );
            isFocused = state.index === menuTabIndex;
            return (
              <TouchableOpacity
                key={route.key}
                onPress={toggleDrawer}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={isFocused ? MenuActive : MenuInactive}
                  style={{ width: 28, height: 28 }}
                />
                <Text
                  style={{
                    color: isFocused ? "#115566" : "#999999",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  เมนู
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => {
                if (route.name === "Library") {
                  navigation.navigate("Library", { screen: "LibraryHome" });
                } else {
                  // use navigate instead of jumpTo (typed) to switch tabs
                  navigation.navigate(route.name as any);
                }
              }}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? "#115566" : "#999999",
                size: 28,
              })}
              <Text
                style={{
                  color: isFocused ? "#115566" : "#999999",
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
            <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7fb" }}>
              {userId ? (
                // Authenticated: show main tab navigator
                <Tab.Navigator
                  screenOptions={{ headerShown: false }}
                  tabBar={(props) => <CustomTabBar {...props} />}
                >
                  <Tab.Screen
                    name="Library"
                    options={{
                      tabBarLabel: "ห้องสมุด",
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
                      tabBarLabel: "ชั้นหนังสือ",
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
                        userProfile={userProfile}
                        shelfBooks={shelfBooks}
                        isLoading={isLoading}
                        token={token}
                        onRefresh={refreshBooks}
                      />
                    )}
                  </Tab.Screen>

                  <Tab.Screen
                    name="Search"
                    options={{
                      tabBarLabel: "ค้นหา",
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

                  <Tab.Screen name="Menu" component={MenuStackScreen} />
                </Tab.Navigator>
              ) : (
                // Not authenticated: show auth stack (Login + Register)
                <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                  <AuthStack.Screen name="Login" component={LoginScreen} />
                  <AuthStack.Screen
                    name="Register"
                    component={RegisterScreen}
                  />
                  <AuthStack.Screen
                    name="RegisterOtp"
                    component={RegisterOtpScreen}
                  />
                </AuthStack.Navigator>
              )}

              {/* pass logout to DrawerMenu so it can call and trigger userId -> null */}
              <DrawerMenu
                visible={drawerVisible}
                onClose={closeDrawer}
                userProfile={userProfile}
                onLogout={logout}
              />
            </SafeAreaView>
          </NavigationContainer>
        </DrawerContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
