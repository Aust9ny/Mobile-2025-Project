import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import styles from "../styles/LoginScreenStyle";
const Icon = { uri: "https://via.placeholder.com/128" };
import useAuth from "../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseConfig } from '../services/firebase';
import { useRef } from 'react';
import { RegisterScreen } from './RegisterOtpScreen'


const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { registerWithEmailFirebase, startPhoneOtp } = useAuth();
  const [userName, setUserName] = useState("");
  const [Fname, setFName] = useState("");
  const [Lname, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const regIdentifier = (email?.trim() || phone?.trim());
  const recaptchaRef = useRef<any>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!Fname.trim()) return "กรุณากรอกชื่อ";
    if (!Lname.trim()) return "กรุณากรอกนามสกุล";
    if (!email && !phone && !userName) return "กรุณากรอกอีเมล หรือเบอร์โทรศัพท์ หรือชื่อผู้ใช้";
    if (email && !email.includes("@")) return "อีเมลไม่ถูกต้อง";
    if (password.length < 6) return "รหัสผ่านอย่างน้อย 6 ตัวอักษร";
    if (password !== confirm) return "รหัสผ่านไม่ตรงกัน";
    return null;
  };

const onRegister = async () => {
  const err = validate();
  if (err) {
    setFormError(err);
    return;
  }
  setFormError(null);
// If email or phone provided, go via Firebase flows
  if (email.trim()) {
    const ok = await registerWithEmailFirebase(email.trim(), password, Fname.trim(), Lname.trim());
    if (ok) navigation.goBack();
    return;
  }
  if (phone.trim()) {
    const ok = await startPhoneOtp(phone.trim(), recaptchaRef.current);
    if (ok) {
      navigation.navigate('RegisterOtpScreen', {
        firebase: true,
        identifier: phone.trim(),
        payload: { first_name: Fname.trim(), last_name: Lname.trim() }
      });
    }
    return;
  }
  // Fallback (no email/phone): just do nothing or show error
};

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: 40 }}>
        <FirebaseRecaptchaVerifierModal ref={recaptchaRef} firebaseConfig={firebaseConfig as any} />
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerContainer}>
          <Image source={Icon} style={styles.logo} />
          <Text style={{ fontWeight: "bold", fontSize: 24, color: "white" }}>
            ลงทะเบียน
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="ชื่อผู้ใช้"
            placeholderTextColor="#888"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
            textContentType="username"
          />
          <TextInput
            style={styles.input}
            placeholder="ชื่อ"
            placeholderTextColor="#888"
            value={Fname}
            onChangeText={setFName}
            textContentType="name"
          />
          <TextInput
            style={styles.input}
            placeholder="นามสกุล"
            placeholderTextColor="#888"
            value={Lname}
            onChangeText={setLName}
            textContentType="name"
          />
          <TextInput
            style={styles.input}
            placeholder="อีเมล"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />
        <TextInput
            style={styles.input}
            placeholder="เบอร์โทรศัพท์ (ถ้ามี)"
            placeholderTextColor="#888"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />
          <TextInput
            style={styles.input}
            placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
          />
          <TextInput
            style={styles.input}
            placeholder="ยืนยันรหัสผ่าน"
            placeholderTextColor="#888"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          {(formError || error) && <Text style={styles.errorText}>{formError || error}</Text>}

          <TouchableOpacity
            style={[
              styles.button,
              (loading || (!email && !phone && !userName) || !password || password !== confirm) && styles.buttonDisabled,
            ]}
            onPress={onRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>ลงทะเบียน</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
