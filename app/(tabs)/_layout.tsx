import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';



export default function TabsLayout() {
  const colorScheme = useColorScheme();

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
            <Text style={{ color: focused ? "#1DA1FA" : color , fontSize: 10}}>Home</Text>
          ),
          tabBarIcon: ({ color, focused } : { color: string; focused: boolean }) => <IconSymbol size={28} name="house.fill" color={focused ? "#1DA1FA" : color} />,
        }}
        
      />
       <Tabs.Screen
        name="joinRide"
        options={{
          tabBarLabel: ({ color, focused } : { color: string; focused: boolean }) => (
            <Text style={{ color: focused ? "#1DA1FA" : color , fontSize: 10}}>Join Ride</Text>
          ),
          tabBarIcon: ({ color, focused } : { color: string; focused: boolean }) => <IconSymbol size={28} name="person.2.fill" color={focused ? "#1DA1FA" : color} />,
        }}
      />
      <Tabs.Screen
        name="createRide"
        options={{
          tabBarLabel: ({ color, focused } : { color: string; focused: boolean }) => (
            <Text style={{ color: focused ? "#1DA1FA" : color , fontSize: 10}}>Create Ride</Text>
          ),
          tabBarIcon: ({ color, focused } : { color: string; focused: boolean }) => <IconSymbol size={28} name="paperplane.fill" color={focused ? "#1DA1FA" : color} />,
        }}
      />
    </Tabs>
  );
}
