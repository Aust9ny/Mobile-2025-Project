import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { styles } from '../styles/DrawerMenuStyle';

import MenuIcon from '../assets/charm_menu-hamburger-color.png';
import AccountIcon from '../assets/famicons_person.png';
import ContactIcon from '../assets/fluent_contact-card-group-28-filled.png';
import FavoriteIcon from '../assets/mdi_heart-black.png';
import HistoryIcon from '../assets/material-symbols_history.png';
import LogoutIcon from '../assets/material-symbols_logout.png';

type Props = {
  visible: boolean;
  onClose: () => void;
  userProfile?: { photoURL?: string };
};

export default function DrawerMenu({ visible, onClose, userProfile }: Props) {
  const navigation = useNavigation<any>();
  if (!visible) return null;

  const handleNavigate = (screenName: string) => {
    onClose(); // ปิด Drawer

    // ไป Tab Menu
    navigation.navigate('Menu');

    // navigate หน้าใน MenuStack
    navigation.dispatch(
      CommonActions.navigate({
        name: screenName,
      })
    );
  };

  const handleLogout = () => {
    onClose();
    navigation.replace('LoginScreen');
  };

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <View style={styles.drawer}>
        <Text style={styles.drawerTitle}>เมนู <Image source={MenuIcon}/></Text>
        <View style={styles.divider} />

        <ScrollView>
          <Pressable style={styles.menuItem} onPress={() => handleNavigate('ProfileScreen')}>
            <Text style={styles.menuText}>บัญชีผู้ใช้</Text>
            <Image source={AccountIcon}/>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => handleNavigate('ContactScreen')}>
            <Text style={styles.menuText}>ติดต่อห้องสมุด</Text>
            <Image source={ContactIcon}/>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => handleNavigate('FavoriteScreen')}>
            <Text style={styles.menuText}>รายการโปรด</Text>
            <Image source={FavoriteIcon}/>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => handleNavigate('HistoryScreen')}>
            <Text style={styles.menuText}>ประวัติการอ่าน</Text>
            <Image source={HistoryIcon}/>
          </Pressable>
        </ScrollView>

        <Pressable style={[styles.menuItem, styles.logout]} onPress={handleLogout}>
          <Text style={[styles.menuText, { color: '#FF3B30' }]}>ออกจากระบบ</Text>
          <Image source={LogoutIcon}/>
        </Pressable>
      </View>
    </Pressable>
  );
}
