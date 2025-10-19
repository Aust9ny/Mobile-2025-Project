// ProfileScreen.tsx
import React from 'react';
import { View, Text, Image, TextInput, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/ProfileScreenStyle';
import LogoutIcon from '../assets/material-symbols_logout.png';

type Props = {
  userProfile?: {
    studentId?: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string;
  };
};

export default function ProfileScreen({ userProfile }: Props) {
  const navigation = useNavigation<any>();

  const handleLogout = () => navigation.replace('LoginScreen');
  const handleSwitchAccount = () => navigation.replace('LoginScreen');
  const handleBack = () => navigation.goBack();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>บัญชี</Text>
      </View>

      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: userProfile?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
          style={styles.profileImage}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput value={userProfile?.studentId || ''} editable={false} placeholder="รหัสนิสิต" style={styles.inputField} />
        <TextInput value={userProfile?.firstName || ''} editable={false} placeholder="ชื่อจริง" style={styles.inputField} />
        <View>
          <TextInput value={userProfile?.lastName || ''} editable={false} placeholder="นามสกุล" style={styles.inputField} />
          <Pressable onPress={handleSwitchAccount}>
            <Text style={styles.switchLabel}>เปลี่ยนบัญชี</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.bottomButtons}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Image source={LogoutIcon} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </Pressable>

        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>ย้อนกลับ</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
