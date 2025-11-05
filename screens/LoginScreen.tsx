import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "../assets/Icon.png";
import styles from "../styles/LoginScreenStyle";
import useAuth from "../hooks/useAuth";
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseConfig } from '../services/firebase';
import ReactNative, { useRef } from 'react';

const LoginScreen = () => {
  const { loginWithIdentifier, loginWithEmailFirebase, startPhoneOtp, confirmPhoneOtp, loading, error } = useAuth();
  const navigation = useNavigation<any>();
  const recaptchaRef = useRef<any>(null);

  const [identifier, setIdentifier] = useState(""); // email or phone or username
  const [password, setPassword] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const onLogin = async () => {
    if (isEmail(identifier)) {
      const ok = await loginWithEmailFirebase(identifier.trim(), password);
      if (ok) navigation.goBack();
      return;
    }
    if (isPhone(identifier)) {
      if (!otpRequested) {
        const ok = await startPhoneOtp(identifier.replace(/\s|-/g, ''), recaptchaRef.current);
        if (ok) setOtpRequested(true);
      } else {
        if (otpCode.length === 6) {
          const ok = await confirmPhoneOtp(otpCode.trim());
          if (ok) navigation.goBack();
        }
      }
      return;
    }
    // Fallback to backend identifier+password if neither email nor phone format
    const ok = await loginWithIdentifier(identifier.trim(), password);
    if (ok) navigation.goBack();
  };

  const isEmail = (v: string) => /.+@.+\..+/.test(v);
  const isPhone = (v: string) => /^\+?\d{7,15}$/.test(v.replace(/\s|-/g, ""));

  const onPressRegister = () => navigation.navigate("Register");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FirebaseRecaptchaVerifierModal ref={recaptchaRef} firebaseConfig={firebaseConfig as any} />
      <View style={styles.headerContainer}>
        <Image source={Icon} style={styles.logo} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>เข้าสู่ระบบ</Text>

        <TextInput
          style={styles.input}
          placeholder="อีเมล/เบอร์โทร/ชื่อผู้ใช้"
          placeholderTextColor="#888"
          value={identifier}
          onChangeText={(v) => { setIdentifier(v); setOtpRequested(false); setOtpCode(""); setDevOtp(null); }}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="username"
        />

        { (isEmail(identifier) || isPhone(identifier)) ? (
          <>
            {otpRequested && (
              <TextInput
                style={styles.input}
                placeholder="รหัส OTP 6 หลัก"
                placeholderTextColor="#888"
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {devOtp && <Text style={{ color: '#0A4851', textAlign: 'center', marginBottom: 8 }}>DEV OTP: {devOtp}</Text>}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={onLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{otpRequested ? 'ยืนยันและเข้าสู่ระบบ' : 'ขอรหัส OTP'}</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="รหัสผ่าน"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={[styles.button, (loading || !identifier || !password) && styles.buttonDisabled]}
              onPress={onLogin}
              disabled={loading || !identifier || !password}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={[, { marginTop: 12 }]} onPress={onPressRegister}>
          <Text style={styles.linkButtonText}>ยังไม่มีบัญชี? ลงทะเบียน</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
