import React, { useEffect, useState } from 'react';
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Gauge from '../helper/Gauge';
import { Colors } from '@/constants/Colors';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, query, onSnapshot, where } from '@react-native-firebase/firestore';
import categories from '../helper/categories';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {

  const db = getFirestore();
  const userRef = collection(db, 'user');
  const pollRef = collection(db, 'poll');
  const [usernames, setUsernames] = useState({});
  const [hypeScore, setHypeScore] = useState(0);
  const [username, setUsername] = useState('');
  const router = useRouter();

  const fetchAndCacheUsername = async (uid) => {
    if(usernames[uid]) {
      return;
    }

    try {
      const docRef =  doc(userRef, uid);
      const docSnap = await getDoc(docRef);
      const userData = docSnap.data();
      setUsernames(prev => ({ ...prev, [uid]: userData.name}));
    }
    catch(e) {
      console.error("Fetching username went wrong: ", e)
    }
  }

  const [polls, setPolls] = useState([]);

  const fetchAllPolls = () => {

    const unsub = onSnapshot(pollRef, (querySnapshot) => {
      const fetchedPolls = [];
      querySnapshot.forEach((doc) => {
        fetchedPolls.push({id: doc.id, ...doc.data()});
        fetchAndCacheUsername(doc.data().uid);
      });
      setPolls(fetchedPolls);
    });

    return unsub;
  };

  useEffect(()=> {

    const fetchCurrentUser = async () => {

      const user = getAuth().currentUser;
      if(user) {
        try {
          const docSnap = await getDoc(doc(userRef, user.uid));
          setHypeScore(docSnap.data().hype_score);
          setUsername(docSnap.data().name);
        }
        catch(e){
          console.error("Something went wrong fetching the current user: ", e);
        }
      }

    }
    
    fetchCurrentUser();

    const unsub = fetchAllPolls();

    console.log(usernames);
    return () => unsub && unsub();

  }, [])

  return (

    <ImageBackground source={require("@/assets/images/bg.png")} resizeMode='cover' style={styles.bgImage}>
    <SafeAreaView style={styles.container}>
        <Text style={styles.welcomeText}>{username}</Text>
        <Text style={styles.hypescoreText} >Your HYPE score: {hypeScore}</Text>
        
        <FlatList
        data={polls}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        renderItem={({item}) => (
          <View>
              <Pressable onPress={()=>{router.push('/create')}}>
                <View style={styles.postContainer}>
                    <View style={styles.postContentContainer}>
                      <Text style={{fontSize: 14, color: 'gray'}}>{usernames[item.uid]}</Text>
                      <Text style={{fontSize: 10}}>{categories.find(category => category.value == item.category)?.label ||"Unknown"}</Text>
                      <Text numberOfLines={4} >{item.title}</Text>
                    </View>
                    <Gauge no={item.leftVotes} yes={item.rightVotes}></Gauge>
                </View>
              </Pressable>
            </View>
        )}
        />
    </SafeAreaView>
    </ImageBackground>

  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10, 
    justifyContent: 'center',
    alignItems: 'center'
  },
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
    height: 125,
    padding: 10
  },
  welcomeText: {
    fontSize: 25,
    fontStyle: 'italic',
  },
  hypescoreText: {
    fontSize: 14,
    marginBottom: 20
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    flex: 1,
  }
});