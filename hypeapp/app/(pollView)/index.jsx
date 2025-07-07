import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, ImageBackground, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Gauge from '@/app/helper/Gauge';
import { getFirestore, doc, getDoc, collection, getDocs, query, onSnapshot, where, updateDoc, limit, orderBy, getCountFromServer, startAfter } from '@react-native-firebase/firestore';
import categories, { mapCategory } from '@/app/helper/categories';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getServerTimeMillis, serverTimeOffset, startCountDown } from '@/app/helper/DurationCountDown';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import backgrounds from '../helper/backgrounds';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {

  const category = useLocalSearchParams();

  const db = getFirestore();
  const userRef = collection(db, 'user');
  const pollRef = collection(db, 'poll');

  const router = useRouter();

  const [usernames, setUsernames] = useState({});

  const [polls, setPolls] = useState([]);
  const pollIdsRef = useRef(new Set());

  const [timeLeft, setTimeLeft] = useState({});
  const timeLeftBuffer = useRef({});
  const isUpdateScheduled = useRef(false);
  const countDownStopFunctions = useRef({});

  const [isLoadingFirstPolls, setIsLoadingFirstPolls] = useState(true);
  const isLoadingPolls = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allPollsLoaded, setAllPollsLoaded] = useState(false);
  const filter = useRef(0);
  const filterChanged = useRef(true);

  const flatListRef = useRef(null);

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

  const fetchRandomPolls = async () => {
    let fetchedPolls = [];
    for(let i = 0; i < 10; i++) {
      const fetchedPoll = await fetchRandomPoll();
      if(fetchedPoll) {
        fetchedPolls.push(fetchedPoll);
      }
    }
    return fetchedPolls;
  }

  const lastVisible = useRef(null);
  const fetchNewestPolls = async () => {
    try {
      let docSnap;
      if(isRefreshing || filterChanged.current) {
        lastVisible.current = null;
        docSnap = await getDocs(query(pollRef,
          orderBy('start_at', 'desc'),
          where('category', '==', parseInt(category.value)),
          limit(10)));
      }
      else {
        docSnap = await getDocs(query(pollRef, orderBy('start_at', 'desc'),
        where('category', '==', parseInt(category.value)),
        startAfter(lastVisible.current),
        limit(10)));
      }

      if(docSnap.docs.length > 0) {
        lastVisible.current = docSnap.docs[docSnap.docs.length-1];
      }

      const fetchedPolls = docSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return fetchedPolls;

    }
    catch(e) {
      console.error("Error when loading newest polls: ", e);
    }
  }

  const fetchVotingClosedPolls = async () => {
    try {
      const serverTime = await getServerTimeMillis(db);
      let docSnap;

      if(isRefreshing || filterChanged.current) {
        lastVisible.current = null;
        docSnap = await getDocs(query(pollRef,
          orderBy('expires_at', 'desc'),
          where('category', '==', parseInt(category.value)),
          where('expires_at', '<=', serverTime),
          limit(10)));
      }
      else {
        docSnap = await getDocs(query(pollRef,
          orderBy('expires_at', 'desc'),
          where('category', '==', parseInt(category.value)),
          where('expires_at', '<=', serverTime),
          startAfter(lastVisible.current),
          limit(10)));
      }
      
      if(docSnap.docs.length > 0) {
        lastVisible.current = docSnap.docs[docSnap.docs.length-1];
      }

      const fetchedPolls = docSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return fetchedPolls;

    }
    catch(e) {
      console.error("Error when loading newest polls: ", e);
    }
  }

  const startPollCountDown = (poll) => {

    if(countDownStopFunctions.current[poll.id]) return;
    
    const stopCountDown = startCountDown(poll.start_at, poll.seconds, (remaining)=>{
    setTimeLeft(prev => ({...prev, [poll.id]: remaining})); })  
    countDownStopFunctions.current[poll.id] = stopCountDown;
  }


  const fetchNewPolls = async () => {
    try {
        console.log("New polls loading");
        let fetchedPolls = [];

        if(isRefreshing || filterChanged.current) {
          pollIdsRef.current = new Set();
        }

        switch(filter.current) {

          case 0: // Newest
            fetchedPolls = await fetchNewestPolls();
            break;
          case 1:
            fetchedPolls = await fetchVotingClosedPolls();
            break;
          case 2: // Random
            fetchedPolls = await fetchRandomPolls();
            break;
        }

        if(isRefreshing || filterChanged.current) {
            setPolls([]);
            filterChanged.current = false;
        }

        if(fetchedPolls.length == 0) {
            setAllPollsLoaded(true);
            console.log("No more polls to load (fetchNewestPolls)");
        }
        
        fetchedPolls.forEach((fetchedPoll) => {
          fetchAndCacheUsername(fetchedPoll.uid);
          startPollCountDown(fetchedPoll);
        })

        if(fetchedPolls.length > 0) {
          setPolls(prev => [...prev, ...fetchedPolls]);
          setAllPollsLoaded(false);
        }
        
      }
      catch(e) {
        console.error("Error when fetching poll info: ", e);
      }
  }

  useEffect(()=> {

    const loadFirstPolls = async () => {
      try{
        await fetchNewPolls();
      }
      catch(e) {
        console.error("Error when fetching new polls: ", e);
      }
      finally {
        setIsLoadingFirstPolls(false);
      }
    }

    loadFirstPolls();

    return () => {
      stopAllCountdowns();
    }

  }, [])

  const stopAllCountdowns = () => {
      Object.values(countDownStopFunctions.current).forEach(stopFn => {
        if (stopFn) stopFn();
      });
      countDownStopFunctions.current = {};
    };

  const onRefresh = React.useCallback(async () => {

    if(isLoadingPolls.current || isRefreshing) {
      console.log("Refresh not possible now");
      return;
    }

    console.log("Reloading because refreshing");

    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    setIsRefreshing(true);
    await fetchNewPolls();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const onEndReached = async () => {

    if(isLoadingPolls.current || isRefreshing) {
      console.log("OnEndReached() not possible now");
      return;
    }
    
    try {
      //if(polls.length >= 20) {
        //  setPolls([]);
        //  pollIdsRef.current = new Set();
        //}
      console.log("Reloading because end reached");
      isLoadingPolls.current = true;
      await fetchNewPolls(); 
    }
    catch(e) {
      console.error("Error when loading polls (onEndreached)", e);
    }
    finally {
      isLoadingPolls.current = false;
    }

  }

  if(isLoadingFirstPolls) {
      return(
        <ImageBackground source={backgrounds.baseBG} style={{flex: 1}}>
              <ActivityIndicator size='large'/>
          </ImageBackground>
      )
  }


  return (
    <ImageBackground source={backgrounds.hypeBG} style={{flex: 1}}>

      <SafeAreaView style={{flex: 1}}>
        <View style={styles.sortingBar}>

          <SegmentedControl
            values={['Newest', 'Voting closed', 'Random']}
            selectedIndex={filter.current}
            onChange={(event) => {
              filter.current = event.nativeEvent.selectedSegmentIndex;
              filterChanged.current = true;
              onRefresh();
            }}
            enabled={!isRefreshing}
          />
        </View>

        <FlatList
        ref={flatListRef}
        data={polls}
        style={{flex: 1}}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          //isLoadingPolls.current
          //? 
          //<ActivityIndicator size='large'/>
          //: 
          <Button title={allPollsLoaded ? "Refresh page": "Load more"} onPress={async ()=>{
            console.log("Load more Button triggered"); 
            if(allPollsLoaded) {
              await onRefresh();
            }
            else {
              await onEndReached()
            }
          }}/>
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
      </SafeAreaView>
    </ImageBackground>

    

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