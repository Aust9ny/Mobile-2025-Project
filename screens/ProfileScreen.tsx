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
import * as ImagePicker from 'expo-image-picker';
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
  const [photo, setPhoto] = useState(userProfile?.photoURL);

  const handleLogout = () => {
    console.log('Logout');
  };

  const handleSwitchAccount = () => {
    console.log('Switch Account');
  };

  const handleChangeProfilePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'ไม่มีสิทธิ์เข้าถึงรูปภาพ',
        'กรุณาเปิดสิทธิ์เข้าถึงรูปภาพในตั้งค่าโทรศัพท์'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>บัญชี</Text>
      </View>

      {/* Profile Image + Inputs */}
      <View style={styles.centerContent}>
        <Pressable onPress={handleChangeProfilePhoto} android_ripple={{ color: '#ccc' }}>
          <Image
            source={{
              uri: photo || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            }}
            style={styles.profileImage}
          />
        </Pressable>

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

          <View style={{ width: '100%' }}>
            <TextInput
              value={userProfile?.lastName || ''}
              editable={false}
              placeholder="นามสกุล"
              style={styles.inputField}
            />
            <Pressable onPress={handleSwitchAccount} style={{ width: '100%' }}>
              <Text style={styles.switchLabel}>เปลี่ยนบัญชี</Text>
            </Pressable>
          </View>
        </View>

      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Image source={LogoutIcon} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
