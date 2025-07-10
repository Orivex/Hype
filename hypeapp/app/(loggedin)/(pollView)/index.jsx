import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, ImageBackground, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Gauge from '@/app/helper/Gauge';
import { getFirestore, doc, getDoc, collection, getDocs, query, onSnapshot, where, updateDoc, limit, orderBy, getCountFromServer, startAfter } from '@react-native-firebase/firestore';
import categories, { mapCategory } from '@/app/helper/categories';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getServerTimeMillis, serverTimeOffset, startCountDown } from '@/app/helper/DurationCountDown';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import backgrounds from '../../helper/backgrounds';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/app/helper/colors';
import { useUser } from '@/app/context/UserContext';
import { timeToString } from '@/app/helper/timeToString'

export default function Index() {

  const {category, isUserPolls, isSavedPolls} = useLocalSearchParams();

  const db = getFirestore();

  const router = useRouter();
  const {user} = useUser();

  const [polls, setPolls] = useState([]);
  const pollIdsRef = useRef(new Set());

  const [timeLeft, setTimeLeft] = useState({});
  const countDownStopFunctions = useRef({});

  const [isLoadingFirstPolls, setIsLoadingFirstPolls] = useState(true);
  const isLoadingPolls = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allPollsLoaded, setAllPollsLoaded] = useState(false);

  const filter = useRef(0);
  const filterChanged = useRef(true);

  const lastVisible = useRef(null);

  const flatListRef = useRef(null);

  const checkRef = () => {
    if(isSavedPolls == 'true') {
      return collection(db, 'user', user.uid, 'saved_polls');
    }

    return collection(db, 'poll'); // Default poll reference
  }

  const checkAdditionalQuery = (q) => {

    if(lastVisible.current) {
      q = query(q, startAfter(lastVisible.current));
    }

    if(isUserPolls == 'true') {
      q = query(q, where('username', '==', user.displayName));
    }

    if(category) {
      q = query(q, where('category', '==', parseInt(category)));
    }

    return q;
  }

  const fetchNewestPolls = async () => {
    try {
      let q;
      let docSnap;

      q = query(checkRef(),
        orderBy('start_at', 'desc'),
        limit(10));

      q = checkAdditionalQuery(q);

      docSnap = await getDocs(q);

      if(docSnap.docs.length > 0) {
        lastVisible.current = docSnap.docs[docSnap.docs.length-1];
      }

      return docSnap.docs;

    }
    catch(e) {
      console.error("Error when loading newest polls: ", e);
    }
  }

  const fetchVotingClosedPolls = async () => {
    try {
      const serverTime = await getServerTimeMillis(db);

      let q;
      let docSnap;

      q = query(checkRef(),
        orderBy('expires_at', 'desc'),
        where('expires_at', '<=', serverTime),
        limit(10));

      q = checkAdditionalQuery(q);

      docSnap = await getDocs(q);
      
      if(docSnap.docs.length > 0) {
        lastVisible.current = docSnap.docs[docSnap.docs.length-1];
      }

      return docSnap.docs;

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

  const fetchNewPolls = async (isRefresh) => {
    try {
        console.log("New polls loading");
        let docs = [];

        if(isRefresh || filterChanged.current) {
          pollIdsRef.current = new Set();
          lastVisible.current = null;
        }

        switch(filter.current) {

          case 0:
            // HOT
          break;
          case 1:
            docs = await fetchNewestPolls();
          break;
          case 2:
            docs = await fetchVotingClosedPolls();
            break;
        }

        if(isRefresh || filterChanged.current) {
            setPolls([]);
            filterChanged.current = false;
        }

        if(docs.length == 0) {
            setAllPollsLoaded(true);
            console.log("No more polls to load (fetchNewestPolls)");
        }

        
        const fetchedPolls = docs.map(doc => ({
          id: doc.id,
          postedAgo: timeToString( (Date.now() + serverTimeOffset) - doc.data().start_at ),
          ...doc.data()
        }))
        
        fetchedPolls.forEach((fetchedPoll) => {
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
        await fetchNewPolls(false);
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
    await fetchNewPolls(true);
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
      await fetchNewPolls(false); 
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
        <ImageBackground source={backgrounds.hypeBG} style={{flex: 1, justifyContent: 'center'}}>
            <ActivityIndicator size='large'/>
        </ImageBackground>
      )
  }


  return (
    <ImageBackground source={backgrounds.hypeBG} style={{flex: 1}}>

      <SafeAreaView style={{flex: 1}}>
        <View style={styles.sortingBar}>

          <SegmentedControl
            values={['Hot', 'Newest', 'Voting closed']}
            selectedIndex={filter.current}
            tintColor={colors.orange}
            backgroundColor={colors.red1}
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
          <View style={styles.postContainer}>
              <Pressable onPress={()=>{router.push({
                pathname: '/(pollView)/vote',
                params: item
              })}}>
                <View style={styles.postContentContainer}>
                    <View style={styles.userInfoContainer}>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, color: colors.red1, fontWeight: 'bold'}}>{item.username}</Text>
                        <Text style={{fontSize: 14, color: 'black'}}> posted in </Text>
                        <Text style={{fontSize: 16, color: colors.red2}}>{mapCategory(item.category)}</Text>
                      </View>
                      <Text style={{fontSize: 11, color: 'black'}}>{item.postedAgo} ago</Text>
                    </View>
                    <View style={styles.textContainer} >
                      <Text numberOfLines={6} style={{fontSize: 20, color: 'black'}} >{item.title}</Text>
                    </View>
                    <View style={styles.gaugeContainer}>
                      <Gauge
                        gaugeWidth={130}
                        gaugeHeight={80}
                        gaugeRadius={60}
                        pointerLength={20}
                        leftLabel={item.left_label}
                        rightLabel={item.right_label}
                        leftVotes={item.left_votes}
                        rightVotes={item.right_votes}
                      />
                      <View style={styles.timeLeft}>
                        <AntDesign name="clockcircleo" size={20} color="black" />
                        <Text style={{textAlignVertical: 'center',fontSize: 18, color: 'black'}}>{timeLeft[item.id] != 0 ? timeLeft[item.id]: "Voting closed!"}</Text>
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
    backgroundColor: colors.yellow,
    padding: 20
  },
  postContainer: {
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderBottomWidth: 1,
    borderColor: 'gray',
    height: 400,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'green',
  },
  postContentContainer: {
    justifyContent: 'space-between',
    //backgroundColor: 'yellow',
  },
  userInfoContainer: {
    padding: 10,
    width: '100%',
    height: 75,
    justifyContent: 'center'
    //backgroundColor: 'green',
  },
  textContainer: {
    padding: 20,
    height: 200,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: colors.orange,
    width: '95%',
    alignSelf: 'center'
    //backgroundColor: 'pink',
  },
  gaugeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 5,
    flexDirection: 'row',
    marginTop: 15,
    //backgroundColor: 'white',
  },
  timeLeft: {
    width: 160,
    height: 75,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems:'center',
  }
});