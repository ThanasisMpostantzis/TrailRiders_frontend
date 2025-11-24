import { Ionicons } from '@expo/vector-icons'; // Import για το εικονίδιο
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Easing } from 'react-native-reanimated';
import { forgotPasswordApi } from "../../api/authApi";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [flag, setFlag] = useState(false); // Flag για την επιτυχία


  const handleForgot = async () => {
    if (!email) {
      return Alert.alert('Error', 'Please enter your email');
    }

    try {
      const data = await forgotPasswordApi(email);
      console.log("Email sent:", data);
      
      setFlag(true);

      setTimeout(() => {
        router.replace('/loginRegister/login');
      }, 2500);

    } catch (err: any) {
      console.log("Forgot error:", err);

      //DONT FORGET TO ADD CUSTOM ALLERT BOX
      Alert.alert("Error", err.toString() || "Something went wrong");
    }
  };

  // Success Screen
  if (flag) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
         <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <Ionicons name="mail-open" size={100} color="#1DA1FA" />
        </MotiView>
        <Text style={{ marginTop: 20, fontSize: 20, fontWeight: 'bold', color: '#1DA1FA' }}>
          Email Sent!
        </Text>
        <Text style={{ marginTop: 10, color: '#666', textAlign: 'center', paddingHorizontal: 40 }}>
          Please check your inbox for instructions to reset your password.
        </Text>
      </View>
    );
  }

  // Κανονική Οθόνη
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, easing: Easing.out(Easing.ease) }}
          style={styles.card}
        >
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#999"
            autoCapitalize="none" // Σημαντικό για email
          />

          <TouchableOpacity style={styles.button} onPress={handleForgot}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backContainer}
            onPress={() => router.push('/loginRegister/login')}
          >
            <Text style={styles.backArrow}>⟵</Text>
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#1DA1FA', // Άλλαξα το χρώμα για να ταιριάζει με τα άλλα
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DA1FA', // Και εδώ
    marginRight: 8,
    marginBottom: '2%'
  },
  backText: {
    color: '#1DA1FA', // Και εδώ
    fontSize: 16,
    fontWeight: '600',
  },
});