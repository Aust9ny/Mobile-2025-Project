import React, { createContext, useContext } from "react";
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  Platform, // ⭐️ ย้าย Platform มาอยู่ด้านบน
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

// Auth
import { AuthProvider, useAuth } from "./hooks/context/AuthContext";
// ⭐️ ใช้ Hook ดึง Shelf Data
import useShelfBooks from "./hooks/useShelfBooks"; 

// Screens
import LibraryScreenStack from "./screens/LibraryScreen";
import ShelfScreen from "./screens/ShelfScreen";
import SearchScreen from "./screens/SearchScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ContactScreen from "./screens/ContactScreen";
import FavoriteScreen from "./screens/FavoriteScreen";
import HistoryScreen from "./screens/HistoryScreen";
import DrawerMenu from "./components/DrawerMenu";

// Auth Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

// Icons
import libraryActive from "./assets/hugeicons_bookshelf-03-color.png";
import libraryInactive from "./assets/hugeicons_bookshelf-03.png";
import MyShelfInactive from "./assets/hugeicons_book-open-02.png";
import MyShelfActive from "./assets/hugeicons_book-open-02-color.png";
import SearchInActive from "./assets/iconamoon_search-light.png";
import SearchActive from "./assets/iconamoon_search-light-color.png";
import MenuInactive from "./assets/charm_menu-hamburger.png";
import MenuActive from "./assets/charm_menu-hamburger-color.png";

// Drawer Context
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
const MenuStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

/* ---------------- MENU STACK (Profile, Contact, etc) ---------------- */
function MenuStackScreen() {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <MenuStack.Screen name="ContactScreen" component={ContactScreen} />
      <MenuStack.Screen name="FavoriteScreen" component={FavoriteScreen} />
      <MenuStack.Screen name="HistoryScreen" component={HistoryScreen} />
    </MenuStack.Navigator>
  );
}

/* ---------------- MAIN APP WRAPPER ---------------- */
export default function App() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
}

function AppRoot() {
  const auth = useAuth();

  if (!auth.isAuthReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {auth.userID ? (
          <AppContent /> // logged in → go to main app
        ) : (
          <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
          </AuthStack.Navigator> // not logged in → login/register stack
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

/* ---------------- APP CONTENT (Auth Switch) ---------------- */
function AppContent() {
  const { userID, userToken, logout } = useAuth();
  
  // ⭐️ ใช้ Hook ดึงเฉพาะหนังสือที่ถูกยืม (Shelf Data)
  const { shelfBooks, isLoading, fetchBooks } = useShelfBooks();
  
  // ⭐️ Profile สำหรับแสดงผล
  const userProfile = { 
      photoURL: "https://placehold.co/100x100/386156/FFFFFF?text=User", 
      userId: userID
  };

  const [drawerVisible, setDrawerVisible] = useState(false);
  const toggleDrawer = () => setDrawerVisible((p) => !p);
  const closeDrawer = () => setDrawerVisible(false);

  /* ----- Custom Tab Bar ----- */
  const CustomTabBar = ({
    state,
    descriptors,
    navigation,
  }: BottomTabBarProps) => {
    // ต้องเรียก useDrawer() ภายใน component ที่ถูก render
    const { toggleDrawer } = useDrawer(); 

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
          const isFocused = state.index === index;

          if (route.name === "Menu") {
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
                    color: isFocused ? "#115566" : "#999",
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
              onPress={() => navigation.navigate(route.name as any)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? "#115566" : "#999",
                size: 28,
              })}
              <Text
                style={{
                  color: isFocused ? "#115566" : "#999",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {typeof options.tabBarLabel === "function"
                  ? options.tabBarLabel({
                      focused: isFocused,
                      color: isFocused ? "#115566" : "#999",
                      position: "below-icon",
                      children: route.name,
                    })
                  : options.tabBarLabel ?? route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <DrawerContext.Provider value={{ toggleDrawer, drawerVisible }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7fb" }}>
        {userID ? (
          /* -------- LOGGED IN = Show Main Tabs -------- */
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
              {/* LibraryScreenStack ควรดึง Catalog เอง */}
              {() => (
                <LibraryScreenStack
                  userId={userID}
                  userProfile={userProfile}
                  
                  // 🎯 FIX 1: ส่ง shelfBooks เข้าไปตามที่ LibraryScreenStack คาดหวัง
                  shelfBooks={shelfBooks} 
                  
                  // 🎯 FIX 2: ส่ง refreshShelf (ซึ่งคือ fetchBooks) เข้าไป
                  refreshShelf={fetchBooks}
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
              {/* ส่ง Shelf Data ไปที่ ShelfScreen */}
              {() => (
                <ShelfScreen
                  userProfile={userProfile}
                  shelfBooks={shelfBooks}
                  isLoading={isLoading}
                  onRefresh={fetchBooks}
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
          /* -------- NOT LOGGED IN = Auth Screens -------- */
          <Text>Should not be seen. Rerouting...</Text>
        )}

        <DrawerMenu
          visible={drawerVisible}
          onClose={closeDrawer}
          userProfile={userProfile}
          onLogout={logout}
        />
      </SafeAreaView>
    </DrawerContext.Provider>
  );
}