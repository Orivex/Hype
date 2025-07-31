import { Stack } from 'expo-router';
import { View } from 'react-native';


export default function RootLayout() {

  return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <Stack>
            <Stack.Screen name="(login)" options={{ headerShown: false }} />
            <Stack.Screen name="(loggedin)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
        </Stack>
      </View>
  );
}
