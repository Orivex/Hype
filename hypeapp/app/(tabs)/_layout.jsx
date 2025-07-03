import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { UserProvider } from '../context/UserContext';

export default function TabLayout() {

  return (

    <UserProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.orange.base,
          tabBarInactiveTintColor: Colors.orange.base05,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: 'gold'
          }
          }}>

        <Tabs.Screen
          name="index"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <AntDesign name="find" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color }) =><AntDesign name="pluscircle" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <FontAwesome name="user-circle" size={28} color={color}/>,
          }}
        />

      </Tabs>
    </UserProvider>
  );
}
