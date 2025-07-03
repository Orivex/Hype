import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, ImageBackground, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Gauge from '@/app/helper/Gauge';
import { getFirestore, doc, getDoc, collection, getDocs, query, onSnapshot, where, updateDoc, limit, orderBy, getCountFromServer } from '@react-native-firebase/firestore';
import categories, { mapCategory } from '@/app/helper/categories';
import Background from '@/app/helper/Background';
import AntDesign from '@expo/vector-icons/AntDesign';
import { estimateServerTimeOffeset, startCountDown } from '@/app/helper/DurationCountDown';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

export default function Index() {

  const category = useLocalSearchParams();

  const db = getFirestore();
  const userRef = collection(db, 'user');
  const pollRef = collection(db, 'poll');

  const router = useRouter();

  const [usernames, setUsernames] = useState({});

  const [polls, setPolls] = useState([]);
  const pollIdsRef = useRef(new Set());

  const [serverTimeOffset, setServerTimeOffset] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const timeLeftBuffer = useRef({});
  const isUpdateScheduled = useRef(false);
  const countDownStopFunctions = useRef({});

  const [isLoadingData, setIsLoadingData] = useState(true);
  const isLoadingPolls = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filter = useRef(0);

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
          const data = doc.data();
          fetchedPoll = { id: doc.id, ...data };
          pollIdsRef.current.add(doc.id);
          fetchAndCacheUsername(data.uid);
        }
        
        return fetchedPoll;

    }

    let q = query(pollRef, orderBy('__name__'), where('category', '==', parseInt(category.value)), where('__name__', '>=', randomId),  limit(1));
    let fetchedPoll = await tryFetch(q);

    //Fallback
    if(fetchedPoll == null) {
      let q = query(pollRef, orderBy('__name__'), where('category', '==', parseInt(category.value)), where('__name__', '>=', ' '),  limit(1));
      fetchedPoll = await tryFetch(q);
    }

    return fetchedPoll;
  }

  const newestPollIndex = useRef(null);
  const fetchNewestPolls = async () => {
    try {
      if(newestPollIndex.current == null) {
        return await getDocs(query(pollRef, orderBy('start_at'), limit(10))); 
      }
    }
    catch(e) {
      console.error("Error when loading newest polls: ", e);
    }
  }

  const batchedSetTimeLeft = (pollId, remaining) => {
    timeLeftBuffer.current[pollId] = remaining;

    if (isUpdateScheduled.current) return;

    isUpdateScheduled.current = true;

    setTimeout(() => {
      setTimeLeft(prev => ({ ...prev, ...timeLeftBuffer.current }));

      timeLeftBuffer.current = {};
      isUpdateScheduled.current = false;

    }, 0);
  }

  const startPollCountDown = (poll) => {
    if(!countDownStopFunctions.current[poll.id]) {
      const stopCountDown = startCountDown(poll.start_at, poll.seconds, serverTimeOffset, (remaining)=>{
      batchedSetTimeLeft(poll.id, remaining);
    })  
      countDownStopFunctions.current[poll.id] = stopCountDown;
    }
  }


  const fetchNewPolls = async (refreshing) => {
    try {
        console.log("New polls loading");
        let fetchedPolls = [];

        if(refreshing) {
          pollIdsRef.current = new Set();
        }

        switch(filter.current) {
          case 0: // Newest
            //fetchNewestPolls();
          break;
        }

        for(let i = 0; i < 10; i++) {
          const fetchedPoll = await fetchRandomPoll();
          if(fetchedPoll) {
            fetchedPolls.push(fetchedPoll);
            startPollCountDown(fetchedPoll);
          }
        }

        if(refreshing) {
            setPolls([]);
        }

        setPolls(prev => [...prev, ...fetchedPolls]);
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
        setIsLoadingData(false);
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

    if(isLoadingPolls.current || isRefreshing) {
      console.log("Refresh not possible now");
      return;
    }

    console.log("Reloading because refreshing");
    setIsRefreshing(true);
    await fetchNewPolls(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const onEndReached = async () => {

    //if(polls.length >= 15) {
      //  pollIdsRef.current = new Set();
      //  setPolls([]);
      //}
      
    if(isLoadingPolls.current || isRefreshing) {
      console.log("OnEndReached() not possible now");
      return;
    }
      
    console.log("Reloading because end reached");
    isLoadingPolls.current = true;

    try {
      if(polls.length >= 20) {
        setPolls([]);
        pollIdsRef.current = new Set();
      }
      await fetchNewPolls(false); 
    }
    catch(e) {
      console.error("Error when loading polls (onEndreached)", e);
    }
    finally {
      isLoadingPolls.current = false;
    }

  }

  if(isLoadingData) {
      return(
          <Background>
              <ActivityIndicator size='large'/>
          </Background>
      )
  }


  return (
    <Background>

      <View style={styles.sortingBar}>

        <SegmentedControl
          values={['Newest', 'Voting closed', 'Random']}
          selectedIndex={filter.current}
          onChange={(event) => {
            filter.current = event.nativeEvent.selectedSegmentIndex;
            onRefresh();
          }}
          enabled={!isRefreshing}
        />
      </View>

      <FlatList
      data={polls}
      style={{flex: 1}}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      onEndReached={async ()=>{await onEndReached()}}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoadingPolls.current
        ? 
        <ActivityIndicator size='large'/>
        : 
        <Button title='Load more' onPress={async ()=>{console.log("Load more Button triggered"); await onEndReached()}}/>
      }
      renderItem={({item}) => (
        <View>
            <Pressable onPress={()=>{router.push({
              pathname: '/vote',
              params: item
            })}}>
              <View style={styles.postContainer}>
                  <View style={styles.postContentContainer}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{fontSize: 16, color: 'gray', fontWeight: 'bold'}}>{usernames[item.uid]}</Text>
                      <Text style={{fontSize: 14, color: 'black'}}> posted in </Text>
                      <Text style={{fontSize: 16, color: 'gray'}}>{mapCategory(item.category)}</Text>
                    </View>
                    <Text style={{fontSize: 10, color: 'black'}}>ID: {item.id}</Text>
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
  sortingBar: {
    marginTop: 60,
    height: 80,
    width: '100%',
    backgroundColor: 'white',
    padding: 20
  },
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