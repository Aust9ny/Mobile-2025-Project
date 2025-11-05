import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, Image, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import styles from '../styles/LoginScreenStyle';
import Icon from '../assets/Icon.png';
import useAuth from '../hooks/useAuth';

// Route params: { identifier: string; payload: { username?, first_name, last_name, email?, phone_number?, password }; devOtp?: string|null }
const RegisterOtpScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { confirmPhoneOtp, loading, error, registerWithEmailFirebase, verifyOtpRegister, register } = useAuth();

  const { identifier, payload, devOtp, firebase } = route.params || {};
  const [code, setCode] = useState('');

  const onConfirm = async () => {
    if (firebase) {
      const ok = await confirmPhoneOtp(code.trim(), payload?.first_name, payload?.last_name);
      if (ok) return; // auth state will switch to main
      return;
    }
    const ok = await verifyOtpRegister(identifier, code.trim());
    if (!ok) return;
    const done = await register(payload);
    if (done) navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: 40 }}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerContainer}>
          <Image source={Icon} style={styles.logo} />
          <Text style={{ fontWeight: 'bold', fontSize: 24, color: 'white' }}>ยืนยัน OTP</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>เราได้ส่งรหัสไปที่ {identifier}</Text>
          {devOtp ? (<Text style={{ color: '#0A4851', textAlign: 'center', marginBottom: 8 }}>DEV OTP: {devOtp}</Text>) : null}
          <TextInput
            style={styles.input}
            placeholder="รหัส OTP 6 หลัก"
            placeholderTextColor="#888"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity
            style={[styles.button, (loading || code.length !== 6) && styles.buttonDisabled]}
            onPress={onConfirm}
            disabled={loading || code.length !== 6}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>ยืนยันและสร้างบัญชี</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterOtpScreen;
