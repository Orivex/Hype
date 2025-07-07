import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { UserProvider } from '../context/UserContext';
import { estimateServerTimeOffset } from '../helper/DurationCountDown';
import { getFirestore } from '@react-native-firebase/firestore';
import colors from '../helper/colors';

export default function TabLayout() {

  useEffect(()=> {

    const db = getFirestore();

    const loadData = async () => {
      try {
        await estimateServerTimeOffset(db);
      }
      catch(e) {
        console.error("Error when estimating serverTimeOffset: ", e);
      }
      finally {
        console.log("Happened");
      }
    }

    loadData();
  
  }, [])

  return (

    <UserProvider>
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
