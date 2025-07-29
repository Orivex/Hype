import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, View, Pressable, Text, Alert, ImageBackground, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from '@react-native-firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import backgrounds from '../helper/backgrounds';
import textInputStyle from '../helper/textInputStyle';
import colors from '../helper/colors';
import deviceSizes from '../helper/deviceSizes';



const deviceWidth = deviceSizes.deviceWidth;
const deviceHeight = deviceSizes.deviceHeight;

export default function SignUp() {

  const db = getFirestore();
  const userRef = collection(db, 'user');

  const router = useRouter();

  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [passwordRepeat, setPasswordRepeat] = useState(''); 

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const usernameExists = async () => {
    try {
      const q = query(userRef, where('name', '==', username));
      const docSnap = await getDocs(q);
  
      if(!docSnap.empty) {
          Alert.alert("Username already exists");
          return true;
      }
  
      return false;
    }
    catch(e) {
      console.error("Error when usernameExists(): ", e);
    }
  }

  const addUser = async (uid) => {
    try {
      const user ={
        name: username.trim(),
        hype_score: 0
      }

      await setDoc(doc(userRef, uid), user)
    }
    catch(e) {
      console.error("Adding user didn't work", e);
    }
  }

  const signUp = async () => {

    if(!username || !email || !password || !passwordRepeat) {
      Alert.alert("Please fill in all fields");
      return;
    }

    if(password !== passwordRepeat) {
      Alert.alert("The repeated password does not match the first password");
      return;
    }

    if(await usernameExists()) {
      Alert.alert("Username already exists");
      return;
    }

    createUserWithEmailAndPassword(getAuth(), email, password)
      .then(async (userCredential) => {

        setIsCreatingUser(true);

        const user = userCredential.user;

        await user.sendEmailVerification();

        Alert.alert('Email verification', 'We have sent you an email. Please click the verification link and then sign in');

        setUsername('');
        setEmail('');
        setPassword('');
        
        await updateProfile(user, {
          displayName: username
        })

        await addUser(user.uid);

        router.push('/(login)/sign-in');
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('That email address is already in use!', 'If you did not create an account with that email, please click "Forgot password" ');
        }
        else if (error.code === 'auth/invalid-email') {
          Alert.alert('That email address is invalid!');
        }
        else if (error.code === 'auth/weak-password') {
          Alert.alert('Too weak password. You need at least 6 characters');
        }
        else {
          Alert.alert("Sign up didn't work: ", error.message);
        }
      });

  }

  if(isCreatingUser) {
    return(
        <ImageBackground source={backgrounds.baseBG} style={{flex: 1, justifyContent: 'center'}}>
            <ActivityIndicator size='large'/>
        </ImageBackground>
      )
  }

  return (
    <ImageBackground source={backgrounds.baseBG} style={{flex: 1, justifyContent: 'center'}}>
      <SafeAreaView style={styles.container}>
        <Image source={require('@/assets/images/logo.png')} style={{width: deviceWidth/3, height: deviceHeight/6}}></Image>
        <TextInput
        value={username}
        onChangeText={(text) => {
          const clean = text.replace(/[^a-zA-Z0-9]/g, '');
          setUsername(clean);
        }}
        style={textInputStyle}
        placeholder='Username'
        placeholderTextColor={'gray'}
        maxLength={25}
        autoCapitalize='none'
        />
        <TextInput
        value={email.trim()}
        onChangeText={setEmail}
        style={textInputStyle}
        placeholder='Email address'
        placeholderTextColor={'gray'}
        autoCapitalize='none'
        />
        <TextInput
        value={password.trim()}
        onChangeText={setPassword}
        style={textInputStyle}
        placeholder='Password'
        placeholderTextColor={'gray'}
        secureTextEntry={true}
        autoCapitalize='none'
        />
        <TextInput
        value={passwordRepeat.trim()}
        onChangeText={setPasswordRepeat}
        style={textInputStyle}
        placeholder='Repeat password'
        placeholderTextColor={'gray'}
        secureTextEntry={true}
        autoCapitalize='none'
        />
        <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Button title='Sign up' color={colors.orange} onPress={()=>{signUp()}} />
        </View>
        <Pressable onPress={()=>{router.push('/sign-in')}}>
          <Text style={{color: colors.orange}} >Already have an account? Sign in here!</Text>
        </Pressable>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 100,
    alignItems: 'center'
  }
})