import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, View, Pressable, Text, Alert, ImageBackground, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, doc, getFirestore, setDoc } from '@react-native-firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import backgrounds from '../helper/backgrounds';

export default function SignUp() {

  const db = getFirestore();
  const userRef = collection(db, "user");

  const router = useRouter();

  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const addUser = async (username, uid) => {
    try {
      const user ={
        name: username,
        hype_score: 0
      }

      await setDoc(doc(userRef, uid), user)
    }
    catch(e) {
      console.error("Adding user didn't work", e);
    }
  }

  const signUp = (username, email, password) => {

    createUserWithEmailAndPassword(getAuth(), email, password)
      .then(async (userCredential) => {

        const user = userCredential.user;

        setIsCreatingUser(true);

        setUsername('');
        setEmail('');
        setPassword('');
        
        await updateProfile(user, {
          displayName: username
        })

        await addUser(username, user.uid);

        console.log('User account created & signed in!');

        router.push('/(loggedin)/(tabs)/explore');
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('That email address is already in use!');
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
        <Button title='Sign up' onPress={()=>{signUp(username, email, password)}} />
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