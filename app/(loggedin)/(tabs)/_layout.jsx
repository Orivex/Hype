import React, { useEffect } from 'react';
import { Stack, Tabs } from 'expo-router';
import { HapticTab } from '@/components/HapticTab';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import colors from '@/app/helper/colors'

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.orange,
          tabBarInactiveTintColor: colors.orange05,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.yellow
          }
        }}>
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <AntDesign name="find" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color }) => <AntDesign name="pluscircle" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <FontAwesome name="user-circle" size={28} color={color} />,
          }}
        />
      </Tabs>
    </>
    
  );
}
