import { ActivityIndicator, Button, ImageBackground, Pressable, StyleSheet } from "react-native";
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useUser } from "@/app/context/UserContext";
import AntDesign from '@expo/vector-icons/AntDesign';
import backgrounds from "@/app/helper/backgrounds";
import colors from "@/app/helper/colors";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';


export default function Profile() {
  const router = useRouter();
  const {user, hypeScore, isLoadingUser} = useUser();

  if(isLoadingUser) {
      return(
        <ImageBackground source={backgrounds.baseBG} style={{flex: 1, justifyContent: 'center'}}>
            <ActivityIndicator size='large'/>
        </ImageBackground>
      )
  }

  const menuElement = (title, icon, onPress) => {
    return(
      <Pressable onPress={onPress} style={styles.menuElement}>
        <View style={styles.menuElementContent}>
          {icon}
          <Text style={styles.menuElementText}>
            {title}
          </Text>
        </View>
      <MaterialIcons name="arrow-right" size={24} color={colors.red1} />
      </Pressable>
    )
  }

  const seperatorComponent = <View style={{borderWidth: 0.5, width: '90%', borderColor: colors.orange}}/>

  return(
    <ImageBackground source={backgrounds.baseBG} style={{flex: 1}}>
      <View style={styles.userInfoContainer}>
        <Text style={styles.usernameText} >{user.name}</Text>
        <Text style={styles.emailText} >{user.email}</Text>
      </View>
      <View style={styles.hypeScoreContainer}>
        <Text style={styles.hypeScoreTextText} >Hype score</Text>
        <Text style={styles.hypeScoreText} >🔥{hypeScore}🔥</Text>
      </View>
      <View style={styles.menuContainer}>
        {menuElement('My polls', <Entypo name="gauge" size={24} color={colors.red1} />, ()=>{
          router.push({
            pathname: '/(pollView)',
            params: {
              category: null,
              isUserPolls: true,
              isSavedPolls: false,
              isVotedPolls: false,
            }
          })})}
        {seperatorComponent}
        {menuElement('Saved polls', <AntDesign name="staro" size={26} color={colors.red1} />, ()=>{
          router.push({
            pathname: '/(pollView)',
            params: {
              category: null,
              isUserPolls: false,
              isSavedPolls: true,
              isVotedPolls: false,
            }
          })
        })}
        {seperatorComponent}
        {menuElement('Voted polls', <Feather name="check-circle" size={26} color={colors.red1} />, ()=>{
          router.push({
            pathname: '/(pollView)',
            params: {
              category: null,
              isUserPolls: false,
              isSavedPolls: false,
              isVotedPolls: true,
            }
          })
        })}
        {seperatorComponent}
        {menuElement('Log out', <SimpleLineIcons name="logout" size={24} color={colors.red1} />, ()=>{signOut(getAuth()).then(()=>{router.replace('/(login)')})})}
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  userInfoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.orange,
    paddingTop: 100,
    paddingBottom: 20,
  },
  hypeScoreContainer: {
    alignSelf: 'center',
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    borderRadius: 20,
    padding: 10,
    //backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: colors.red1
  },
  menuContainer: {
    marginTop: 10,
   // backgroundColor: 'white',
  },
  menuElement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    width: '100%',
    paddingLeft: 25,
    paddingRight: 40,
    borderRadius: 12,
    marginVertical: 8,
  },
  menuElementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuElementText: {
    fontSize: 20,
    color: colors.red2,
    marginLeft: 20,
  },
  hypeScoreTextText: {
    fontSize: 20,
    color: colors.red1,
  },
  hypeScoreText: {
    color: colors.red2,
    fontSize: 75,
  },
  usernameText: {
    fontSize: 35,
    color: colors.red2
  },
  emailText: {
    fontSize: 15,
    color: colors.red1
  }
})