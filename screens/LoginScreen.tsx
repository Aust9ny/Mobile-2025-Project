import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import useAuth from '../hooks/useAuth';

export default function LoginScreen() {
  const { sendOtp, confirmOtp, userId, loading, error } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  return (
    <View style={{ padding: 20 }}>
      {!userId ? (
        <>
          <TextInput
            placeholder="เบอร์โทรศัพท์ (+66...)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
          />
          <Button title="ส่ง OTP" onPress={() => sendOtp(phone)} disabled={loading} />

          <TextInput
            placeholder="กรอก OTP"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            style={{ borderWidth: 1, padding: 8, marginTop: 10 }}
          />
          <Button title="ยืนยัน OTP" onPress={() => confirmOtp(code)} disabled={loading} />
        </>
      ) : (
        <Text>เข้าสู่ระบบสำเร็จ! UID: {userId}</Text>
      )}

      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
