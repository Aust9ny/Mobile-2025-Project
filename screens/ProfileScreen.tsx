import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform, // ⭐️ ต้อง Import Platform สำหรับ FormData
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles/ProfileScreenStyle';
import LogoutIcon from '../assets/material-symbols_logout.png';

import { useAuth } from '../hooks/context/AuthContext';
import API_URL from '../config/apiConfig';

const DEFAULT_PROFILE_URL = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function ProfileScreen() {
  
  const { userID, userToken, logout } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false); // ⭐️ NEW: สถานะอัปโหลดรูป

  // ⭐️ 1. (Fetch Data) ดึงข้อมูล Profile เมื่อหน้าจอโหลด (Unchanged)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userID || !userToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data = await response.json();
        
        setFirstName(data.user.first_name || '');
        setLastName(data.user.last_name || '');
        setStudentId(data.user.SID || 'N/A'); 
        setPhoto(data.user.profile_image_url || null); // 👈 ดึง URL รูปภาพล่าสุด
        
      } catch (error: any) {
        Alert.alert('ผิดพลาด', 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userID, userToken]); 
  
  // -----------------------------------------------------------------
  // ⭐️ NEW FUNCTION: อัปโหลดรูปภาพไปยัง API
  const uploadProfilePhoto = async (imageUri: string) => {
    if (!userToken) return;

    setIsPhotoUploading(true);
    
    // 1. เตรียม FormData
    const formData = new FormData();
    // 🎯 กำหนดชื่อ Field เป็น 'profileImage' หรือตามที่ Backend คาดหวัง
    formData.append('profileImage', { 
      uri: imageUri,
      type: 'image/jpeg', // หรือ image/png
      name: `profile-${userID}-${Date.now()}.jpg`,
    } as any);

    try {
      // 2. เรียก API POST สำหรับอัปโหลดรูปภาพ
      // 🎯 สมมติว่า Backend มี Endpoint '/api/users/profile/photo'
      const response = await fetch(`${API_URL}/api/users/profile/photo`, { 
        method: 'POST',
        headers: {
          // ⚠️ สำคัญ: ไม่ต้องระบุ 'Content-Type': 'application/json' 
          //    เพราะ FormData จะกำหนด Boundary/Content-Type ให้เอง
          'Authorization': `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload photo.');
      }

      const data = await response.json();
      
      // 3. อัปเดต State ด้วย URL รูปภาพใหม่ที่มาจาก Backend
      const newImageUrl = data.profile_image_url; 
      setPhoto(newImageUrl);
      
      Alert.alert('สำเร็จ', 'บันทึกรูปโปรไฟล์ใหม่เรียบร้อย');
      
    } catch (error: any) {
      console.error('Photo upload error:', error);
      Alert.alert('ผิดพลาด', error.message || 'ไม่สามารถอัปโหลดรูปภาพได้');
      // 💡 Rollback รูปภาพที่แสดงผล
      setPhoto(null); 
    } finally {
      setIsPhotoUploading(false);
    }
  };
  // -----------------------------------------------------------------


  // ⭐️ (Update Data) ฟังก์ชันสำหรับ "บันทึก" (ชื่อ/นามสกุล) (Unchanged)
  const handleSaveProfile = async () => {
    // ... (unchanged logic) ...
    try {
        const response = await fetch(`${API_URL}/api/users/me`, {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
            first_name: firstName,
            last_name: lastName
            })
        });

        if (!response.ok) throw new Error('Failed to update profile');

        Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย');
        setIsEditing(false);
        
    } catch (error: any) {
        Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  // ⭐️ ฟังก์ชันสำหรับปุ่ม "แก้ไข" / "บันทึก" (Unchanged)
  const handleToggleEdit = () => {
    if (isEditing) {
      handleSaveProfile(); 
    } else {
      setIsEditing(true); 
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleSwitchAccount = () => {
    logout(); 
  };
  
  // ⭐️ แก้ไข: เรียก uploadProfilePhoto ทันทีหลังเลือกรูป
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
      quality: 0.7, // ลด quality เพื่อลดขนาดไฟล์
    });

    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      
      // 1. แสดงรูปภาพทันที (Optimistic UI)
      setPhoto(selectedUri);
      
      // 2. ⭐️ อัปโหลดรูปภาพไปยัง API
      await uploadProfilePhoto(selectedUri);
    }
  };

  // ⭐️ (Loading State) ถ้ากำลังดึงข้อมูล ให้โชว์ Loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#115566" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header (FIXED: เพิ่มปุ่ม "แก้ไข") */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>บัญชี</Text>
        <Pressable onPress={handleToggleEdit}>
          <Text style={styles.editButton}>
            {isEditing ? 'บันทึก' : 'แก้ไข'} 
          </Text>
        </Pressable>
      </View>

      {/* Profile Image + Inputs */}
      <View style={styles.centerContent}>
        <Pressable 
          onPress={handleChangeProfilePhoto} 
          android_ripple={{ color: '#ccc' }}
          disabled={!isEditing || isPhotoUploading} // 👈 ⭐️ ห้ามกดขณะกำลังอัปโหลด
        >
          {isPhotoUploading ? (
              <View style={[styles.profileImage, styles.photoUploading]}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
          ) : (
              <Image
                source={{
                  uri: photo || DEFAULT_PROFILE_URL, // 👈 ใช้ค่าคงที่
                }}
                style={styles.profileImage}
              />
          )}
        </Pressable>

        <View style={styles.inputContainer}>
          <TextInput
            value={studentId} 
            editable={false} 
            placeholder="รหัสนิสิต"
            style={styles.inputField}
          />
          <TextInput
            value={firstName} 
            onChangeText={setFirstName} 
            editable={isEditing} 
            placeholder="ชื่อจริง"
            style={[styles.inputField, isEditing && styles.inputFieldEditing]}
          />

          <View style={{ width: '100%' }}>
            <TextInput
              value={lastName} 
              onChangeText={setLastName} 
              editable={isEditing} 
              placeholder="นามสกุล"
              style={[styles.inputField, isEditing && styles.inputFieldEditing]}
            />
            <Pressable onPress={handleSwitchAccount} style={{ width: '100%' }}>
              <Text style={styles.switchLabel}>เปลี่ยนบัญชี</Text>
            </Pressable>
          </View>
        </View>

      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Image source={LogoutIcon} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}