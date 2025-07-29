import { Stack } from "expo-router";
import { View, Text } from "react-native";
import colors from "../helper/colors";

export default function LoginLayout() {
    return(
        <Stack>
            <Stack.Screen name="sign-in" options={{headerShown: false}}/>
            <Stack.Screen name="sign-up" options={{headerShown: false}}/>
            <Stack.Screen name="forgot" options={{headerTitle: 'Forgot password', headerStyle: {backgroundColor: colors.yellow}}}/>
        </Stack>
    )
}