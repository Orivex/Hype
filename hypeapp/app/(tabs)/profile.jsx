import { Button, SafeAreaView, StyleSheet } from "react-native";
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();
  return(
    <SafeAreaView style={styles.container}>
      <Button color={'red'} title="Sign out" onPress={()=>{signOut(getAuth()).then(()=>{router.replace('/sign-in')})}}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'center'
  }
})