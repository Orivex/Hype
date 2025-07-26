import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, View, Pressable, Text, Alert, ImageBackground } from 'react-native';
import { getAuth, sendPasswordResetEmail, signInWithCredential, signInWithEmailAndPassword  } from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import backgrounds from '../helper/backgrounds';
import textInputStyle from '../helper/textInputStyle';
import colors from '../helper/colors';

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
        <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Button title='Send email' color={colors.orange} onPress={()=>{
            sendEmail(email.trim())}}
            />
        </View>
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