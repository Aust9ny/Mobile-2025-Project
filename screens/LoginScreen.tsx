import React, { useState } from "react";
import { View, TextInput, Button, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../hooks/context/AuthContext";
export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      const ok = await login(email.trim(), password);
      
      if (!ok) throw new Error("Login failed");
      // navigation will be controlled by auth state in App
    } catch (e: any) {
      alert(e?.message || "Login failed");
    }
  };

  // optionally show provider loading/error
  if (loading) return <ActivityIndicator size="large" />;
  if (error) {
    /* you may render error UI here */
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Email:</Text>
      <TextInput
        style={{ borderWidth: 1 }}
        onChangeText={setEmail}
        value={email}
      />

      <Text>Password:</Text>
      <TextInput
        secureTextEntry
        style={{ borderWidth: 1 }}
        onChangeText={setPassword}
        value={password}
      />

      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Forgot password"
        onPress={() => navigation.navigate("ForgotPassword")}
      />
      <Button
        title="Register →"
        onPress={() => navigation.navigate("Register")}
      />
    </View>
  );
}
