import React, { useState } from 'react';
import { TextInput, Button, SafeAreaView } from 'react-native';
import { getAuth, createUserWithEmailAndPassword  } from '@react-native-firebase/auth';

export default function Index() {

  const createUser = ({email, password}) => {

    console.log(`${email}, ${password}`);

  createUserWithEmailAndPassword(getAuth(), email, password)
    .then(() => {
      console.log('User account created & signed in!');
    })
    .catch(error => {
      if (error.code === 'auth/email-already-in-use') {
        console.log('That email address is already in use!');
      }

      if (error.code === 'auth/invalid-email') {
        console.log('That email address is invalid!');
      }

      console.error(error);
    });
  }


  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 

  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'center', backgroundColor: 'green'}}>
      <TextInput
      value={email}
      onChangeText={setEmail}
      style={{borderWidth: 3}}
      />
      <TextInput
      value={password}
      onChangeText={setPassword}
      style={{borderWidth: 3}}
      />
      <Button title='createUser' onPress={()=>{createUser({email, password})}} />
    </SafeAreaView>
  )
}