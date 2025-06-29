import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';


export default function RootLayout() {

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(login)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="vote/[poll_id]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
}
