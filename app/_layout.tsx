import Splash from '@/app/Splash'; // Ή όπου αλλού έχεις το Splash component
import { Stack } from 'expo-router';
import * as SplashScreenExpo from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { LogBox } from 'react-native';

// Αγνοούμε το warning για το SafeAreaView για να είναι καθαρή η κονσόλα
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

// Κρατάμε το Native Splash (στατική εικόνα) μέχρι να φορτώσει το JS bundle
SplashScreenExpo.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function showCustomSplash() {
      try {
        // Κρύβουμε ΑΜΕΣΩΣ το Native Splash για να φανεί το Custom Splash Component
        // που τρέχει από κάτω
        await SplashScreenExpo.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }

    showCustomSplash();
  }, []);

  // Αν το App δεν είναι έτοιμο, δείχνουμε το Custom Splash
  if (!appIsReady) {
    return (
      <Splash 
        // Μόλις τελειώσει το animation στο Splash.tsx, καλείται αυτό
        // και η εφαρμογή προχωράει στο Login
        onFinish={() => setAppIsReady(true)} 
      />
    );
  }

  return (
    <Stack initialRouteName="loginRegister/loginRegisterScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="loginRegister/loginRegisterScreen" />
      <Stack.Screen name="loginRegister/login" />
      <Stack.Screen name="loginRegister/register" />
      <Stack.Screen name="loginRegister/forgotPassword"/>
      <Stack.Screen name="(tabs)"/>
      <Stack.Screen 
        name="rideDetails/[id]" 
        options={{ 
          presentation: 'card',
          headerTitle: 'Details' 
        }} 
      />
      <StatusBar style='auto'/>
    </Stack>
  );
}