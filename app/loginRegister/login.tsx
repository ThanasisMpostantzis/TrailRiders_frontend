import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginApi } from "../../api/authApi";

export default function Login() {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [flag, setFlag] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const data = await loginApi(userName.trim(), password.trim());
      console.log("Logged in:", data);

      setFlag(true);

      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 1000);

    } catch (err) {
      console.log("Login error:", err);
      
      //DONT FORGET TO ADD CUSTOM ALLERT BOX
      Alert.alert("Login failed. Please check your credentials.");
    }
  };

  if (flag) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="checkmark-circle" size={100} color="#fa881dff" />
        <Text style={{ marginTop: 20, fontSize: 20, fontWeight: 'bold', color: '#1DA1FA' }}>
          Login Successful!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TextInput
        placeholder="Username"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/loginRegister/forgotPassword")}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  subtitle: { fontSize: 16, marginBottom: 24, color: '#666' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#1DA1FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 16, color: '#1DA1FA', fontWeight: '500', textAlign: 'center' },
});