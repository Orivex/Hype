import { View } from "react-native";
import { UserProvider } from "../context/UserContext";
import { Stack } from "expo-router";

export default function LoggedInRootLayout() {
    return(
        <UserProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(pollView)" options={{ headerShown: false }} />
            </Stack>
        </UserProvider>
    )
}