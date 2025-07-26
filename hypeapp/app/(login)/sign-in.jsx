import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, View, Pressable, Text, Alert, ImageBackground } from 'react-native';
import { getAuth, signInWithCredential, signInWithEmailAndPassword  } from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import backgrounds from '../helper/backgrounds';
import textInputStyle from '../helper/textInputStyle';
import colors from '../helper/colors';

export default function SignIn() {
    const router = useRouter();

    const signIn = ({email, password}) => {
      signInWithEmailAndPassword(getAuth(), email, password)
        .then((userCredential) => {
          const user = userCredential.user;

          if(!user.emailVerified) {
            throw Error('not-verified');
          }

          setEmail('')
          setPassword('')
          router.push('/(loggedin)/(tabs)/explore')
        })
        .catch((error) => {
          if(error.message == 'not-verified') {
            Alert.alert('Email verification', 'Please verify your email');
          }
          else if(error.code === 'auth/invalid-credential') {
            Alert.alert('Email or password is wrong');
          }
          else {
            Alert.alert('Sign in error: ', error)
          }
        })
    }

  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 

  return (
    <ImageBackground source={backgrounds.baseBG} style={{flex: 1, justifyContent: 'center'}}>
      <SafeAreaView style={styles.container}>
        <TextInput
        value={email}
        onChangeText={setEmail}
        style={textInputStyle}
        placeholder='Email'
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
        <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Button title='Sign in' color={colors.orange} onPress={()=>{signIn({email, password})}} />
        </View>
        <Pressable style={styles.pressable} onPress={()=>{router.push('/sign-up')}}>
          <Text style={{color: colors.orange}} >Don't have an account? Sign up here!</Text>
        </Pressable>
        <Pressable style={styles.pressable} onPress={()=>{router.push('/forgot')}}>
          <Text style={{color: colors.orange}} >Forgot password</Text>
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
  },
  textInput: {
    padding: 10,
    width: '80%',
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 18,
    color: 'black'
  },
  pressable: {
    marginVertical: 5
  }
})