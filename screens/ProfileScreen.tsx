// ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // <-- แก้ตรงนี้
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
  const [photo, setPhoto] = useState(userProfile?.photoURL);

  const handleLogout = () => navigation.replace('LoginScreen');
  const handleSwitchAccount = () => navigation.replace('LoginScreen');
  const handleBack = () => navigation.goBack();

  const handleChangeProfilePhoto = async () => {
    // ขออนุญาตเข้าถึง Media Library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'ไม่มีสิทธิ์เข้าถึงรูปภาพ',
        'กรุณาเปิดสิทธิ์เข้าถึงรูปภาพในตั้งค่าโทรศัพท์'
      );
      return;
    }

    // เปิด Gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri); // เปลี่ยนรูปโปรไฟล์
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>บัญชี</Text>
      </View>

      {/* Profile Image */}
      <View style={styles.profileImageContainer}>
        <Pressable onPress={handleChangeProfilePhoto} android_ripple={{ color: '#ccc' }}>
          <Image
            source={{
              uri: photo || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            }}
            style={styles.profileImage}
          />
        </Pressable>
      </View>

      {/* Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          value={userProfile?.studentId || ''}
          editable={false}
          placeholder="รหัสนิสิต"
          style={styles.inputField}
        />
        <TextInput
          value={userProfile?.firstName || ''}
          editable={false}
          placeholder="ชื่อจริง"
          style={styles.inputField}
        />
        <View>
          <TextInput
            value={userProfile?.lastName || ''}
            editable={false}
            placeholder="นามสกุล"
            style={styles.inputField}
          />
          <Pressable onPress={handleSwitchAccount}>
            <Text style={styles.switchLabel}>เปลี่ยนบัญชี</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom Buttons */}
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
