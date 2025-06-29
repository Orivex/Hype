import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, View, Pressable, Text, Alert } from 'react-native';
import { getAuth, sendPasswordResetEmail, signInWithCredential, signInWithEmailAndPassword  } from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPassword() {
    const router = useRouter();

    const sendEmail = (email) => {

        sendPasswordResetEmail(getAuth(), email)
        .then(() => {
            Alert.alert("If this email is registered, a reset link was sent. Check your email spam directory!");
            setEmail('');
            router.push('/sign-in');
        })
        .catch((error) => {

            if (error.code === 'auth/invalid-email') {
              Alert.alert('That email address is invalid!');
            }
            else {
              console.error(error);
              Alert.alert("Something went wrong")

            }
        })
    }

  const [email, setEmail] = useState(''); 

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
      value={email}
      onChangeText={setEmail}
      style={styles.textInput}
      placeholder='Email'
      placeholderTextColor={'gray'}
      />
      <View style={{flexDirection: 'row', marginVertical: 10}}>
        <Button title='Send email' onPress={()=>{
          sendEmail(email.trim())}}
          />
      </View>
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