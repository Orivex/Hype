import React, { useState } from 'react';
import { TextInput, Button, SafeAreaView, StyleSheet, View, Pressable, Text } from 'react-native';
import { getAuth, signInWithCredential, signInWithEmailAndPassword  } from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';

export default function SignIn() {
    const router = useRouter();

    const signIn = ({username, email, password}) => {
      signInWithEmailAndPassword(getAuth(), email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log('Signed in as: ', user.displayName);
          router.push('/(tabs)')
        })
        .catch((error) => {
          console.error('Sign in error: ', error.message)
        })

      setUsername('')
      setEmail('')
      setPassword('')
    }


  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
      value={username}
      onChangeText={setUsername}
      style={styles.textInput}
      placeholder='Username'
      placeholderTextColor={'gray'}
      />
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
        <Button title='Sign in' onPress={()=>{signIn({username, email, password})}} />
      </View>
      <Pressable onPress={()=>{router.push('/sign-up')}}>
        <Text style={{color: 'cornflowerblue'}} >Don't have an account? Sign up here!</Text>
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
  }
})