import { Button, StyleSheet } from "react-native";
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useRouter } from "expo-router";
import Background from "../helper/Background";

export default function Profile() {
  const router = useRouter();

  return(
    <Background>
      <Button color={'red'} title="Sign out" onPress={()=>{signOut(getAuth()).then(()=>{router.replace('/(login)')})}}/>
    </Background>
  )
}