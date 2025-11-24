import { Stack } from 'expo-router';
import * as SplashScreenExpo from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import Splash from '@/app/Splash';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreenExpo.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      // Προσομοίωση φόρτωσης assets/API
      await new Promise(resolve => setTimeout(resolve, 6000));
      setAppIsReady(true);
      await SplashScreenExpo.hideAsync();
    }
    prepareApp();
  }, []);

  if (!appIsReady) return <Splash />;

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
          headerShown: false,
          presentation: 'card',
          headerTitle: 'Details' 
        }} 
      />
      <StatusBar style='auto'/>
    </Stack>
  );
}
    
