import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginRegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'dark' : 'light'}/>
      
      <View style={styles.banner}>
        <Image source={require('@/images/logo.webp')} style={styles.logo} />
        <Text style={styles.appName}>Trail Riders</Text>
        <Text style={styles.slogan}>Your next ride is waiting — discover it, plan it, live it.</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/loginRegister/login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/loginRegister/register')}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        {/* Continue with Google */}
        <TouchableOpacity style={styles.googleBtn} onPress={() => console.log('Google Sign In')}>
          <Image 
            source={require('@/images/google-logo.png')} 
            style={styles.googleLogo} 
          />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  banner: { alignItems: 'center', marginTop: 80 },
  logo: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#000000ff' },
  slogan: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 8 },
  buttons: { width: '100%', marginBottom: "25%" },

  loginBtn: {
    backgroundColor: '#1DA1FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  registerBtn: {
    borderColor: '#1DA1FA',
    borderWidth: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerText: { color: '#1DA1FA', fontSize: 16, fontWeight: '600' },
  
  orText: { color:'#000', alignItems: 'center', textAlign: 'center', paddingBlock: '2%', fontWeight: 'bold'},

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ddd',
    borderWidth: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginTop: '3%'
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
