import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Gauge from '../helper/Gauge';
import { Colors } from '@/constants/Colors';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, query, onSnapshot, where, updateDoc } from '@react-native-firebase/firestore';
import categories, { mapCategory } from '../helper/categories';
import Background from '../helper/Background';
import AntDesign from '@expo/vector-icons/AntDesign';
import { calculateTimeLeft, estimateServerTimeOffeset, startCountDown } from '../helper/DurationCountDown';

export default function Index() {

  const db = getFirestore();
  const userRef = collection(db, 'user');
  const pollRef = collection(db, 'poll');

  const router = useRouter();

  const [usernames, setUsernames] = useState({});

  const [polls, setPolls] = useState([]);
  const [leftVotes, setLeftVotes] = useState([]);
  const [rightVotes, setRightVotes] = useState([]);

  const [serverTimeOffset, setServerTimeOffset] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const countDownStopFunctions = useRef({});

  const [isLoading, setIstLoading] = useState(true);

  const fetchAndCacheUsername = async (uid) => {
    if(usernames[uid]) {
      return;
    }

    try {
      const docRef =  doc(userRef, uid);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()) {
        setUsernames(prev => ({ ...prev, [uid]: docSnap.data().name}));
      }
    }
    catch(e) {
      console.error("Fetching username went wrong: ", e)
    }
  }

  const fetchPollVotes = () => {
    const unsub = onSnapshot(pollRef, (docSnap) => {
      const fetchedLeftVotes = [];
      const fetchedRightVotes = [];
      docSnap.forEach(async (doc) => {
        const docData = doc.data();
        if(doc.exists()) {
          fetchedLeftVotes[doc.id] = docData.left_votes;
          fetchedRightVotes[doc.id] = docData.right_votes;
        }
      })

      setLeftVotes(fetchedLeftVotes);
      setRightVotes(fetchedRightVotes);
    })

    return unsub;
  }

  const fetchPollInfo = async () => {
    try {
        const docSnap = await getDoc(pollRef);
        const fetchedPolls = [];
        docSnap.forEach((doc)=> {
          if(doc.exists()) {
              fetchedPolls.push({id: doc.id, ...doc.data()});
              fetchAndCacheUsername(doc.data().uid)
          }
        })

        setPolls(fetchedPolls);
    }
    catch(e) {
        console.error("Error when fetching poll info: ", e);
    }
  }

  useEffect(()=> {

    let unsub;

    const loadData = async () => {
      
      console.log("loading data");

      try {
        setServerTimeOffset(await estimateServerTimeOffeset(db));
        await fetchPollInfo();
        unsub = fetchPollVotes();
      }
      catch(e) {
        console.error("Error when loading data: ", e);
      }
      finally{
        setIstLoading(false);
      }

    }

    loadData();

    return ()=>{
      if(unsub) {
        unsub();
      }
    }

  }, [])

  useEffect(()=> {
    console.log("loaded");
    if(!isLoading && polls.length > 0) {

      Object.values(countDownStopFunctions.current).forEach(stopFn => {
        if(stopFn) stopFn();
      });

      countDownStopFunctions.current = {};

      for(let i = 0; i < polls.length; i++) {
        const pollID = polls[i].id;
        const stopCountDown = startCountDown(polls[i].start_at, polls[i].seconds, serverTimeOffset, (remaining)=>{
            setTimeLeft(prev => ({ ...prev, [pollID]: remaining }));
        })

        countDownStopFunctions.current[pollID] = stopCountDown;
      }

      return () => {
        Object.values(countDownStopFunctions.current).forEach(stopFn => {
          if(stopFn) stopFn();
        });
      }

    }

  }, [isLoading])

  if(isLoading) {
      return(
          <Background>
              <ActivityIndicator size='large'/>
          </Background>
      )
  }

  return (
    <Background>
        <FlatList
        data={polls}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        renderItem={({item}) => (
          <View>
              <Pressable onPress={()=>{router.push({
                pathname: `/vote/${item.id}`,
                params: {id: item.id}
              })}}>
                <View style={styles.postContainer}>
                    <View style={styles.postContentContainer}>
                      <Text style={{fontSize: 14, color: 'gray'}}>{usernames[item.uid]}</Text>
                      <Text style={{fontSize: 10}}>{mapCategory(item.category)}</Text>
                      <Text numberOfLines={4} >{item.title}</Text>
                    </View>

                    <View style={styles.gaugeContainer}>
                      <Gauge
                        gaugeWidth={110}
                        gaugeHeight={80}
                        gaugeRadius={50}
                        pointerLength={20}
                        leftLabel={item.left_label}
                        rightLabel={item.right_label}
                        leftVotes={leftVotes[item.id]}
                        rightVotes={rightVotes[item.id]}
                      />
                      <View style={styles.timeLeft}>
                        <AntDesign name="clockcircleo" size={20} color="black" />
                        <Text>{timeLeft[item.id] != 0 ? timeLeft[item.id]: "Voting closed!"}</Text>
                      </View>
                    </View>


                </View>
              </Pressable>
            </View>
        )}
        />
    </Background>

  )

}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: Colors.yellow.base,
    borderWidth: 5,
    borderColor: 'gray',
    borderRadius: 20,
    height: 125,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
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
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  timeLeft: {
    width: 130,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems:'center',
    marginBottom: 5
  },
});