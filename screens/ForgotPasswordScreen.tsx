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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/LoginScreenStyle";

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSendReset = () => {
    setError(null);
    setMessage(null);
    if (!email.includes("@")) {
      setError("กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }
    setLoading(true);
    // mock send reset email
    setTimeout(() => {
      setLoading(false);
      setMessage("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว หากไม่พบโปรดตรวจสอบโฟลเดอร์สแปม");
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.title}>ลืมรหัสผ่าน</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.subtitle}>กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</Text>

        <TextInput
          style={styles.input}
          placeholder="อีเมล"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
        {message && <Text style={[styles.otpInfo, { color: "#0A4851" }]}>{message}</Text>}

        <TouchableOpacity
          style={[styles.button, (loading || !email) && styles.buttonDisabled]}
          onPress={onSendReset}
          disabled={loading || !email}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>ส่งลิงก์รีเซ็ต</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={[, { marginTop: 12 }]} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkButtonText}>ย้อนกลับไปยังหน้าล็อกอิน</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;