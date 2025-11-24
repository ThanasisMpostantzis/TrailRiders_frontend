import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signupApi } from "../../api/authApi";

export default function Register() {
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [flag, setFlag] = useState(false);
  const router = useRouter();
  

  const handleSignup = async () => {
    // 1. Έλεγχος αν οι κωδικοί ταιριάζουν
    if (password !== confirmPassword) {
      
      //DONT FORGET TO ADD CUSTOM ALLERT BOX
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    // 2. Έλεγχος αν τα πεδία είναι κενά
    if (!userName || !password || !email) {
      
      //DONT FORGET TO ADD CUSTOM ALLERT BOX
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      // 3. Κλήση API (το name δεν το στέλνουμε στο API βάσει του αρχείου authApi που μου έδειξες)
      const data = await signupApi(userName.trim(), password.trim(), email.trim());
      console.log("Signup success:", data);
      
      // 4. Επιτυχία! Εμφανίζουμε το τικ
      setFlag(true);

      // 5. Περιμένουμε 1 δευτερόλεπτο και μετά αλλάζουμε οθόνη
      setTimeout(() => {
        router.replace('./login');
      }, 1000);

    } catch (err: any) {
      console.log("Signup error:", err);
      
      //DONT FORGET TO ADD CUSTOM ALLERT BOX
      Alert.alert("Registration Failed", err.toString());
    }
  };


  // Οθόνη Επιτυχίας
  if (flag) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        {/* Χρησιμοποιούμε το ίδιο μπλε χρώμα (#1DA1FA) για ομοιομορφία με το Login */}
        <Ionicons name="checkmark-circle" size={100} color="#1DA1FA" />
        <Text style={{ marginTop: 20, fontSize: 20, fontWeight: 'bold', color: '#1DA1FA' }}>
          Registration Successful!
        </Text>
      </View>
    );
  }

  // Κανονική Οθόνη Εγγραφής
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account ✨</Text>
      <Text style={styles.subtitle}>Register to get started</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="UserName"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#aaa"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Register</Text>
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
});