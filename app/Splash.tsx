import * as Font from 'expo-font';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

export default function Splash() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current; // useRef για να μην επαναδημιουργείται
  const [progress, setProgress] = useState(0);

  // Φόρτωση γραμματοσειράς
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'JacquesFrancoisShadow': require('@/assets/fonts/JacquesFrancoisShadow-Regular.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // Προσομοίωση φόρτωσης assets/API με σταδιακό progress
  useEffect(() => {
    const minTime = 1000; // minimum 1 δευτερόλεπτο
    const start = Date.now();

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 4;
      if (currentProgress > 100) currentProgress = 100;
      setProgress(currentProgress);
      Animated.timing(progressAnim, {
        toValue: currentProgress,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      if (currentProgress >= 100) clearInterval(interval);
    }, 50);

    // Προσομοίωση φόρτωσης API/asset
    (async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)); // assets/API
      const elapsed = Date.now() - start;
      const remaining = Math.max(minTime - elapsed, 0);
      await new Promise(resolve => setTimeout(resolve, remaining));
      setProgress(100);
    })();

    return () => clearInterval(interval);
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Image source={require('@/images/logo.webp')} style={styles.logo} />
      <Text style={styles.title}>Trail Riders Greece</Text>
      <View style={styles.progressBackground}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { width: 180, height: 180, resizeMode: 'contain', marginBottom: 20 },
  title: { fontFamily: 'JacquesFrancoisShadow', fontSize: 32, color: '#000', marginBottom: 40, textAlign: 'center' },
  progressBackground: { width: '80%', height: 10, backgroundColor: '#ddd', borderRadius: 5, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#2E86AB' },
});
