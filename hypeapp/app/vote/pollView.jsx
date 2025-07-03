import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, ImageBackground, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Gauge from '@/app/helper/Gauge';
import { getFirestore, doc, getDoc, collection, getDocs, query, onSnapshot, where, updateDoc, limit, orderBy, getCountFromServer } from '@react-native-firebase/firestore';
import categories, { mapCategory } from '@/app/helper/categories';
import Background from '@/app/helper/Background';
import AntDesign from '@expo/vector-icons/AntDesign';
import { estimateServerTimeOffeset, startCountDown } from '@/app/helper/DurationCountDown';

export default function PollView() {

  const db = getFirestore();
  const userRef = collection(db, 'user');
  const pollRef = collection(db, 'poll');

  const router = useRouter();

  const [usernames, setUsernames] = useState({});

  const [polls, setPolls] = useState([]);
  const pollIdsRef = useRef(new Set());
  //const [leftVotes, setLeftVotes] = useState([]);
  //const [rightVotes, setRightVotes] = useState([]);

  const [serverTimeOffset, setServerTimeOffset] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const countDownStopFunctions = useRef({});

  const [isLoading, setIsLoading] = useState(true);
  const isLoadingPolls = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const generateRandomAutoId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
  };

  const fetchRandomPoll = async () => {
    const randomId = generateRandomAutoId();
    
    const tryFetch = async (queryRef) => {
      
        let fetchedPoll = null;

        const querySnap = await getDocs(queryRef);
        if(querySnap.empty) {
          return fetchedPoll;
        }

        const doc = querySnap.docs[0];

        if(!pollIdsRef.current.has(doc.id)) {
         // console.log(doc.id);
          const data = doc.data();
          fetchedPoll = { id: doc.id, ...data };
          pollIdsRef.current.add(doc.id);
          fetchAndCacheUsername(data.uid);
        }
        else {
          //console.log(doc.id, " DOUBLE");
        }
        
        return fetchedPoll;

    }

    let q = query(pollRef, orderBy('__name__'), where('__name__', '>=', randomId), limit(1));
    let fetchedPoll = await tryFetch(q);

    if(fetchedPoll == null) {
      q = query(pollRef, orderBy('__name__'), where('__name__', '>=', ' '), limit(1));
      fetchedPoll = await tryFetch(q);
    }

    return fetchedPoll;
  }

  const fetchRandomPolls = async () => {
    try {
        console.log("New polls loading");
        let fetchedPolls = [];

        //console.log((await getCountFromServer(pollRef)).data().count);

        for(let i = 0; i < 10; i++) {
          //console.log("Next: ", i);
          const fetchedPoll = await fetchRandomPoll();
         // console.log("That shit was null: ", fetchedPoll == null)
          if(fetchedPoll) {
            fetchedPolls.push(fetchedPoll);

            if(!countDownStopFunctions.current[fetchedPoll.id]) {
              const stopCountDown = startCountDown(fetchedPoll.start_at, fetchedPoll.seconds, serverTimeOffset, (remaining)=>{
              setTimeLeft(prev => ({ ...prev, [fetchedPoll.id]: remaining }));
            })  
              countDownStopFunctions.current[fetchedPoll.id] = stopCountDown;
            }

            //if(fetchedPolls.length >= 3) {
            //  fetchedPolls = [];
            //  console.log("RAAAAHH RERENDER");
            //}
          }
        }
        setPolls(prev => [...prev, ...fetchedPolls]);
        

        //fetchedPolls.forEach(poll => {
        //  if(!countDownStopFunctions.current[poll.id]) {
        //    const stopCountDown = startCountDown(poll.start_at, poll.seconds, serverTimeOffset, (remaining)=>{
        //    setTimeLeft(prev => ({ ...prev, [poll.id]: remaining }));
        //  })  
        //  countDownStopFunctions.current[poll.id] = stopCountDown;
        //  }
        //})

      }
      catch(e) {
        console.error("Error when fetching poll info: ", e);
      }
  }

  useEffect(()=> {
    
    const loadData = async () => {
      try {
        setServerTimeOffset(await estimateServerTimeOffeset(db));
      }
      catch(e) {
        console.error("Error when loading data: ", e);
      }
      finally{
        setIsLoading(false);
      }

    }

    loadData();

  }, [])

  useEffect(()=> {

    return () => {
      Object.values(countDownStopFunctions.current).forEach(stopFn => {
        if(stopFn) stopFn();
      });
    }

  }, [])


  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setPolls([]);
    pollIdsRef.current = new Set();
    await fetchRandomPolls();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const onEndReached = async () => {
    //if(polls.length >= 15) {
    //  pollIdsRef.current = new Set();
    //  setPolls([]);
    //}

    if(isLoadingPolls.current) {
      return;
    }
    
    isLoadingPolls.current = true;

    try {
      if(polls.length >= 20) {
        setPolls([]);
        pollIdsRef.current = new Set();
      }
      await fetchRandomPolls(); 
    }
    catch(e) {
      console.error("Error when loading polls (onEndreached)", e);
    }
    finally {
      isLoadingPolls.current = false;
    }

  }

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
        style={{flex: 1}}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={async ()=>{await onEndReached()}}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<ActivityIndicator size='large'/>}
        renderItem={({item}) => (
          <View>
              <Pressable onPress={()=>{router.push({
                pathname: `/vote/${item.id}`,
                params: item
              })}}>
                <View style={styles.postContainer}>
                    <View style={styles.postContentContainer}>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, color: 'gray', fontWeight: 'bold'}}>{usernames[item.uid]}</Text>
                        <Text style={{fontSize: 14, color: 'black'}}> posted in </Text>
                        <Text style={{fontSize: 16, color: 'gray'}}>{mapCategory(item.category)}</Text>
                      </View>
                      <Text numberOfLines={6} style={{fontSize: 20, color: 'black'}} >{item.title}</Text>
                    </View>

                    <View style={styles.gaugeContainer}>
                      <Gauge
                        gaugeWidth={120}
                        gaugeHeight={170}
                        gaugeRadius={50}
                        pointerLength={20}
                        leftLabel={item.left_label}
                        rightLabel={item.right_label}
                        leftVotes={item.left_votes}
                        rightVotes={item.right_votes}
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
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderBottomWidth: 1,
    borderColor: 'gray',
    height: 300,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  postContentContainer: {
    //backgroundColor: 'green',
    padding: 20,
    height: '100%',
    width: '60%'
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  //  backgroundColor: 'white',
    height: '100%',
    padding: 5
  },
  timeLeft: {
    width: 130,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems:'center',
    marginTop: 10
  }
});