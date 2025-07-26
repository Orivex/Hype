import { ActivityIndicator, Alert, Button, ImageBackground, Pressable, StyleSheet, TouchableOpacity } from "react-native";
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
import deviceSizes from "@/app/helper/deviceSizes";

const deviceWidth = deviceSizes.deviceWidth;
const deviceHeight = deviceSizes.deviceHeight;

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
      <TouchableOpacity onPress={onPress} style={styles.menuElement}>
        <View style={styles.menuElementContent}>
          {icon}
          <Text style={styles.menuElementText}>
            {title}
          </Text>
        </View>
      <MaterialIcons name="arrow-right" size={24} color={colors.red1} />
      </TouchableOpacity>
    )
  }

  const seperatorComponent = <View style={{borderWidth: 0.5, width: '90%', borderColor: colors.orange}}/>

  return(
    <ImageBackground source={backgrounds.baseBG} style={{flex: 1}}>
      <View style={styles.userInfoContainer}>
        <Text style={styles.usernameText} adjustsFontSizeToFit numberOfLines={1} >{user.name}</Text>
        <Text style={styles.emailText} adjustsFontSizeToFit numberOfLines={1} >{user.email}</Text>
      </View>
      <View style={styles.hypeScoreContainer}>
        <Text style={styles.hypeScoreTextText} >Hype score</Text>
        <Text style={styles.hypeScoreText} adjustsFontSizeToFit numberOfLines={1}>🔥{hypeScore}🔥</Text>
      </View>
      <View style={styles.menuContainer}>
        {menuElement('My polls', <Entypo name="gauge" size={deviceWidth/12} color={colors.red1} />, ()=>{
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
        {menuElement('Saved polls', <AntDesign name="staro" size={deviceWidth/12} color={colors.red1} />, ()=>{
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
        {menuElement('Voted polls', <Feather name="check-circle" size={deviceWidth/12} color={colors.red1} />, ()=>{
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
        {menuElement('Log out', <SimpleLineIcons name="logout" size={deviceWidth/12} color={colors.red1} />, ()=>{
          Alert.alert('Logout', 'Sure you want to log out?', [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Yes',
              onPress: () => signOut(getAuth()).then(()=>{router.replace('/(login)')})
            }
          ])
;
          })}
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
    paddingHorizontal: 10
  },
  hypeScoreContainer: {
    alignSelf: 'center',
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    borderRadius: 20,
    padding: 10,
    height: deviceHeight/4,
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
    height: deviceHeight/15,
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
    fontSize: deviceWidth/17,
    color: colors.red2,
    marginLeft: 20,
  },
  hypeScoreTextText: {
    fontSize: deviceWidth/20,
    color: colors.red1,
  },
  hypeScoreText: {
    color: colors.red2,
    fontSize: deviceWidth/5,
  },
  usernameText: {
    fontSize: deviceWidth/10,
    color: colors.red2,
    textAlign: 'center'
  },
  emailText: {
    fontSize: deviceWidth/20,
    color: colors.red1,
    textAlign: 'center'
  }
})