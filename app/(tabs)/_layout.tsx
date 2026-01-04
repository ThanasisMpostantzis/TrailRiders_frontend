import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import '../../constants/index';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: ({ color, focused } : { color: string; focused: boolean }) => (
            <Text style={{ color: focused ? "#1DA1FA" : color , fontSize: 10}}>{t('home.home')}</Text>
          ),
          tabBarIcon: ({ color, focused } : { color: string; focused: boolean }) => <IconSymbol size={28} name="house.fill" color={focused ? "#1DA1FA" : color} />,
        }}
        
      />
       <Tabs.Screen
        name="joinRide"
        options={{
          tabBarLabel: ({ color, focused } : { color: string; focused: boolean }) => (
            <Text style={{ color: focused ? "#1DA1FA" : color , fontSize: 10}}>{t('home.joinRideMenu')}</Text>
          ),
          tabBarIcon: ({ color, focused } : { color: string; focused: boolean }) => <IconSymbol size={28} name="person.2.fill" color={focused ? "#1DA1FA" : color} />,
        }}
      />
      <Tabs.Screen
        name="createRide"
        options={{
          tabBarLabel: ({ color, focused } : { color: string; focused: boolean }) => (
            <Text style={{ color: focused ? "#1DA1FA" : color , fontSize: 10}}>{t('home.createRide')}</Text>
          ),
          tabBarIcon: ({ color, focused } : { color: string; focused: boolean }) => <IconSymbol size={28} name="paperplane.fill" color={focused ? "#1DA1FA" : color} />,
        }}
      />
    </Tabs>
  );
}
