import { ActivityIndicator, Button, StyleSheet } from "react-native";
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useRouter } from "expo-router";
import Background from "../helper/Background";
import { collection, getFirestore, getDoc, doc, onSnapshot } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { Text } from "react-native";

export default function Profile() {
  const router = useRouter();

  const db = getFirestore();
  const userRef = collection(db, 'user')
  const [user, setUser] = useState(null);
  const [hypeScore, setHypeScore] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const fetchHypeScore = () => {
    const docRef = doc(userRef, user.id);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if(docSnap.exists()) {
        setHypeScore(docSnap.data().hype_score);
      }
    })

    return unsub; 
  }

  const fetchUser = async () => {
    const currentUser = getAuth().currentUser;
    if(!currentUser) {
      return;
    }

    try {
      const docSnap = await getDoc(doc(userRef, currentUser.uid));
      if(docSnap.exists()) {
        setUser({id: currentUser.uid, ...docSnap.data()});
      }
    }
    catch(e) {
      console.error("Error when fetching user: ", e);
    }

  }

  useEffect(()=> {
    const loadData = async () => {
      try {
        await fetchUser();
      }
      catch(e) {
        console.error("Error when loading data: ", e);
      }
      finally {
        setIsLoading(false);
      }
    }

    loadData();

  }, []) 

  useEffect(()=> {

    if(!user) return;

    const unsub = fetchHypeScore();

    return () => {
      if(unsub) {
        unsub();
      }
    }

  }, [user, isLoading])

  if(isLoading) {
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