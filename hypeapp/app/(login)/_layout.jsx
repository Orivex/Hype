import { Stack } from "expo-router";
import { View } from "react-native";

export default function LoginLayout() {
    return(
        <View style={{flex: 1}}>
            <Stack>
                <Stack.Screen name="sign-in" options={{headerShown: false}}/>
                <Stack.Screen name="sign-up" options={{headerShown: false}}/>
                <Stack.Screen name="forgot" options={{headerTitle: 'Forgot password'}}/>
            </Stack>
        </View>
    )
}