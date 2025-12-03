import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

export default function Splash({ onFinish }: { onFinish: () => void }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
         if (onFinish) onFinish();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  useEffect(() => {
    const minTime = 2000;
    const start = Date.now();

    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress > 100) currentProgress = 100;
      
      setProgress(currentProgress);
      
      Animated.timing(progressAnim, {
        toValue: currentProgress,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: false, 
      }).start();

      if (currentProgress >= 100) clearInterval(interval);
    }, 100);

    (async () => {
       await new Promise(resolve => setTimeout(resolve, 1500));
       
       const elapsed = Date.now() - start;
       const remaining = Math.max(minTime - elapsed, 0);
       await new Promise(resolve => setTimeout(resolve, remaining));
       
       setProgress(100); 
    })();

    return () => clearInterval(interval);
  }, []);

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