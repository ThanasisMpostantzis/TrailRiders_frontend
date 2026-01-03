import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const API_BASE = process.env.EXPO_PUBLIC_BASE_URL;

const EXPO_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID!;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!;

export default function LoginRegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  
  const redirectUri = "https://auth.expo.io/@grgktvgr/trailriders";

  console.log('REDIRECT URI =>', redirectUri);

  console.log(EXPO_CLIENT_ID, "  ", ANDROID_CLIENT_ID, "  ", IOS_CLIENT_ID);
  const [request, response, promptAsync] = Google.useAuthRequest({
  // Χρησιμοποίησε το Web Client ID (rjbb)
  clientId: "426736775262-rjbbs0f8mbatoagbnbii8gec7mvhep7v.apps.googleusercontent.com",
  scopes: ['profile', 'email'],
  // Χρησιμοποιούμε το ακριβές link που βάλαμε στη Google
  redirectUri: "https://auth.expo.io/@grgktvgr/trailriders",
});

  useEffect(() => {
    
    const handleGoogleResponse = async () => {
      if (response?.type !== 'success') return;

      const { authentication } = response;
      if (!authentication?.accessToken) return;

      try {
        const googleUser = await axios.get(
          'https://www.googleapis.com/userinfo/v2/me',
          {
            headers: {
              Authorization: `Bearer ${authentication.accessToken}`,
            },
          }
        );

        const { email, name, picture } = googleUser.data;

        const res = await axios.post(`${API_BASE}/googleLogin`, {
          email,
          fullName: name,
          image: picture,
        });

        if (res.data?.user?.id) {
          await AsyncStorage.setItem('userId', String(res.data.user.id));
          router.replace('/');
        }
      } catch (err) {
        console.log('Google login error:', err);
      }
    };
    console.log("--- ΕΛΕΓΧΟΣ RESPONSE ---");
    console.log("Response Object:", response); // Δες αν έρχεται έστω και κενό object

    if (response?.type === 'success') {
      handleGoogleResponse();
    } else if (response?.type === 'error') {
      // Αυτό θα μας πει γιατί η Expo έβγαλε το "Something went wrong"
      console.log("Σφάλμα από τον Proxy:", response.error);
      console.log("Περισσότερες λεπτομέρειες:", response.params);
    }
    handleGoogleResponse();
  }, [response]);

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'dark' : 'light'} />

      <View style={styles.banner}>
        <Image source={require('@/images/logo.webp')} style={styles.logo} />
        <Text style={styles.appName}>Trail Riders</Text>
        <Text style={styles.slogan}>
          Your next ride is waiting — discover it, plan it, live it.
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push('/loginRegister/login')}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.push('/loginRegister/register')}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity
          style={styles.googleBtn}
          disabled={!request}
          onPress={() => promptAsync( {showInRecents: true })}
        >
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
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  banner: {
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  slogan: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  buttons: {
    width: '100%',
    marginBottom: '25%',
  },

  loginBtn: {
    backgroundColor: '#1DA1FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  registerBtn: {
    borderColor: '#1DA1FA',
    borderWidth: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerText: {
    color: '#1DA1FA',
    fontSize: 16,
    fontWeight: '600',
  },

  orText: {
    color: '#000',
    textAlign: 'center',
    paddingVertical: 8,
    fontWeight: 'bold',
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ddd',
    borderWidth: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginTop: '3%',
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
