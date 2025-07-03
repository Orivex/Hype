import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';


export default function PollViewLayout() {

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="vote" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
