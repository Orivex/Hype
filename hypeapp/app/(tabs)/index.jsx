import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Gauge from '../helper/Gauge';
import { Colors } from '@/constants/Colors';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, query } from '@react-native-firebase/firestore';

export default function Index() {

  const db = getFirestore();
  const userRef = collection(db, 'user');
  const [username, setUsername] = useState();

  const getUser = async () => {
    try {
      const user = getAuth().currentUser;
      if(!user) {
        return;
      }

      const docRef = doc(userRef, user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUsername(userData.name);
      }
      else {
        console.log("No such document!");
      }
    }
    catch(e){
      console.error("Getting user didn't work: ", e);
    }
  }

  useEffect(()=> {

    getUser();

  }, [])

  //const [initializing, setInitializing] = useState(true);
  //const [user, setUser] = useState();

  //function handleAuthStateChanged(user) {
  //  setUser(user);
  //  if (initializing) {
  //    setInitializing(false);
  //  }
  //}
//
  //useEffect(() => {
  //  const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
  //  return subscriber; // unsubscribe on unmount
  //}, []);
//
  //if (initializing) {
  //  return null;
  //}

  return (

    <SafeAreaView style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Welcome, {username}!</Text>
        <Post/>
    </SafeAreaView>

  )

}

const Post = () => {
  const [no, setNo] = useState(0);
  const [yes, setYes] = useState(0);
  const router = useRouter();
  return (  
      <Pressable onPress={()=>{router.push('/create')}}>
    <View style={styles.postContainer}>
        <View style={styles.postContentContainer}>
          <Text style={{fontSize: 14, color: 'gray'}}>ChrisRock60</Text>
          <Text style={{fontSize: 10}}>Film industry 🎬</Text>
          <Text>Do you think Will Smith deserves the Oscar? That slap was crazy!</Text>
        </View>

        <Gauge no={no} yes={yes}></Gauge>
    </View>
      </Pressable>
  )
}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: Colors.yellow.base,
    borderWidth: 5,
    borderColor: 'gray',
    borderRadius: 20,
    height: 125,
    width: '95%',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row'
  },
  postContentContainer: {
    width: 150,
    justifyContent: 'center',
  }
});