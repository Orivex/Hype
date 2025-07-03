import { ActivityIndicator, Button, StyleSheet } from "react-native";
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useRouter } from "expo-router";
import Background from "../helper/Background";
import { collection, getFirestore, getDoc, doc, onSnapshot } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useUser } from "../context/UserContext";

export default function Profile() {
  const router = useRouter();
  const {user, hypeScore, isLoadingUser} = useUser();

  if(isLoadingUser) {
      return(
          <Background>
              <ActivityIndicator size='large'/>
          </Background>
      )
  }

  return(
    <Background>
      <Text>Name: {user.name}</Text>
      <Text> Hype score: {hypeScore}</Text>
      <Button color={'red'} title="Sign out" onPress={()=>{signOut(getAuth()).then(()=>{router.replace('/(login)')})}}/>
    </Background>
  )
}