import React, { useState } from "react";
import { useAuth } from "../hooks/context/AuthContext";
// ❗️ ลบ import ที่ไม่ได้ใช้ (auth, updateProfile) เพราะ Context จะจัดการเอง
// import { updateProfile } from "firebase/auth";
// import { auth } from "../services/firebase";
import styles from "../styles/LoginScreenStyle";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert, // 👈 เพิ่ม Alert
} from "react-native";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth(); // 👈 เราจะใช้ register จาก Context

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (password !== confirm) {
      return setErrorMsg("รหัสผ่านไม่ตรงกัน");
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      return setErrorMsg("กรุณากรอกข้อมูล (ชื่อ, นามสกุล, อีเมล) ให้ครบถ้วน");
    }

    setLoading(true);
    setErrorMsg(""); // เคลียร์ error เก่า

    try {
      // 1. ⭐️ เตรียมข้อมูลผู้ใช้ที่จะส่งไป
      const userData = {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };
      
      // 2. ⭐️ เรียก register จาก Context (ซึ่งจะ sync ข้อมูลไป MySQL ด้วย)
      const ok = await register(userData, password.trim());
      
      if (!ok) {
        throw new Error("สมัครสมาชิกไม่สำเร็จ (Context error)");
      }

      // 3. ⭐️ ไม่ต้องทำอะไรต่อ! (ไม่ต้อง navigate("Login"))
      // เพราะเมื่อ AuthProvider มี user, 
      // AppRoot.tsx จะสลับหน้าไปที่ AppContent (หน้าหลัก) ให้อัตโนมัติ

    } catch (e: any) {
      // ⭐️ ใช้ Alert แทน setErrorMsg (เพราะ e.message จาก Firebase/API ชัดเจนกว่า)
      Alert.alert("สมัครสมาชิกล้มเหลว", e?.message || "สมัครสมาชิกไม่สำเร็จ");
      // setErrorMsg(e?.message || "สมัครสมาชิกไม่สำเร็จ");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <Text style={styles.title}>สมัครสมาชิก</Text>

        <TextInput
          style={styles.input}
          placeholder="ชื่อ"
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