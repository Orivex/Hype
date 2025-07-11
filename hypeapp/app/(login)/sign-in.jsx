import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, View, Pressable, Text, Alert } from 'react-native';
import { getAuth, signInWithCredential, signInWithEmailAndPassword  } from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignIn() {
    const router = useRouter();

    const signIn = ({email, password}) => {
      signInWithEmailAndPassword(getAuth(), email, password)
        .then(() => {
          setEmail('')
          setPassword('')
          router.push('/(loggedin)/(tabs)/explore')
        })
        .catch((error) => {
          if(error.code === 'auth/invalid-credential') {
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
    <SafeAreaView style={styles.container}>
      <TextInput
      value={email}
      onChangeText={setEmail}
      style={styles.textInput}
      placeholder='Email'
      placeholderTextColor={'gray'}
      />
      <TextInput
      value={password}
      onChangeText={setPassword}
      style={styles.textInput}
      placeholder='Password'
      placeholderTextColor={'gray'}
      />
      <View style={{flexDirection: 'row', marginVertical: 10}}>
        <Button title='Sign in' onPress={()=>{signIn({email, password})}} />
      </View>
      <Pressable style={styles.pressable} onPress={()=>{router.push('/sign-up')}}>
        <Text style={{color: 'cornflowerblue'}} >Don't have an account? Sign up here!</Text>
      </Pressable>
      <Pressable style={styles.pressable} onPress={()=>{router.push('/forgot')}}>
        <Text style={{color: 'cornflowerblue'}} >Forgot password</Text>
      </Pressable>
    </SafeAreaView>
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
    width: '80%',
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 18
  },
  pressable: {
    marginVertical: 5
  }
})