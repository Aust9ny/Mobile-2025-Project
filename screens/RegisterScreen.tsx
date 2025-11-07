import React, { useState } from "react";
import { useAuth } from "../hooks/context/AuthContext";
import {styles} from "../styles/LoginScreenStyle";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
// ⭐️ IMPORT: นำเข้า navigation hook เพื่อการนำทางที่ชัดเจน
import { useNavigation } from "@react-navigation/native"; 


export default function RegisterScreen() { // ❌ ลบ { navigation } ออกและใช้ useNavigation
  const { register } = useAuth(); 
  const navigation = useNavigation<any>(); // ⭐️ ใช้ useNavigation

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // ⭐️ 1. เพิ่ม State สำหรับ SID (Student ID)
  const [sid, setSid] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(""); 
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    // 1. ตรวจสอบเงื่อนไข
    if (password !== confirm) {
      return setErrorMsg("รหัสผ่านไม่ตรงกัน");
    }
    const requiredFields = [firstName, lastName, email, sid, password, confirm];
    if (requiredFields.some(field => !field.trim())) {
      return setErrorMsg("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    setLoading(true);
    setErrorMsg(""); 

    try {
      // 2. เตรียมข้อมูลผู้ใช้ที่จะส่งไป
      const userData = {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        sid: sid.trim(), 
      };
      
      // 3. เรียก register จาก Context (จะทำการส่ง Email Link/OTP และสร้างบัญชี Local)
      const result = await register(userData, password.trim());
      
      if (!result) {
        throw new Error("การลงทะเบียนไม่สมบูรณ์");
      }
      
      // 4. 🎯 นำทางไปยังหน้าจอแจ้งเตือนการยืนยันตัวตน
      Alert.alert(
        "ลงทะเบียนสำเร็จ", 
        "กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชีและเริ่มใช้งาน"
      );
      
      // ⭐️ นำทางไปหน้า Login หรือหน้า Waiting (ที่ควรสร้าง)
      navigation.navigate('Login'); 

    } catch (e: any) {
      // ⭐️ แจ้ง Error จาก Firebase/API
      Alert.alert("สมัครสมาชิกล้มเหลว", e?.message || "สมัครสมาชิกไม่สำเร็จ");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{paddingVertical: 40}}>
        <Text style={styles.title}>สมัครสมาชิก</Text>

        {/* ⭐️ ช่อง SID */}
        <TextInput
          style={styles.input}
          placeholder="รหัสนิสิต (SID)"
          value={sid}
          onChangeText={setSid}
          autoCapitalize="none"
          keyboardType="number-pad"
          maxLength={10} // สมมติว่ารหัสนิสิตมี 10 หลัก
        />
        
        <TextInput
          style={styles.input}
          placeholder="ชื่อจริง"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="นามสกุล"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="อีเมล"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="รหัสผ่าน"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="ยืนยันรหัสผ่าน"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          onPress={onRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>สร้างบัญชี</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.textButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.textButtonText}>มีบัญชีอยู่แล้ว? กลับไปล็อกอิน</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}