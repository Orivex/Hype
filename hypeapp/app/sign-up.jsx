import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, doc, getFirestore, setDoc } from '@react-native-firebase/firestore'
import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {

  const db = getFirestore();
  const userRef = collection(db, "user");

  const router = useRouter();

  const addUser = async ({username, uid}) => {
    try {
      const user ={
        name: username,
        hype_score: 0
      }
      const docRef = doc(userRef, uid);
      await setDoc(docRef, user)
    }
    catch(e) {
      console.error("Adding user didn't work", e);
    }
  }

  const signUp = ({username, email, password}) => {

    createUserWithEmailAndPassword(getAuth(), email, password)
      .then(async (userCredential) => {

        await addUser({username, uid: userCredential.user.uid});

        console.log('User account created & signed in!');

        setUsername('');
        setEmail('');
        setPassword('');

        router.push('/(tabs)');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error("Sign up didn't work: ", error);
      });

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
      placeholder='Email address'
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
        <Button title='Sign up' onPress={()=>{signUp({username, email, password})}} />
      </View>
      <Pressable onPress={()=>{router.push('/sign-in')}}>
        <Text style={{color: 'cornflowerblue'}} >Already have an account? Sign in here!</Text>
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