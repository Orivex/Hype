import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, Dimensions, FlatList, ImageBackground, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
import deviceSizes from '@/app/helper/deviceSizes';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';

  const deviceWidth = deviceSizes.deviceWidth;
  const deviceHeight = deviceSizes.deviceHeight;

  export default function Index() {

    const {category, isUserPolls, isSavedPolls, isVotedPolls} = useLocalSearchParams();
    
    const db = getFirestore();

    const router = useRouter();
    const {user} = useUser();

    const [polls, setPolls] = useState([]);
    const [leftVotes, setLeftVotes] = useState({});
    const [rightVotes, setRightVotes] = useState({});

    const [timeLeft, setTimeLeft] = useState({});
    const countDownStopFunctions = useRef({});

    const [isLoadingFirstPolls, setIsLoadingFirstPolls] = useState(true);
    const isLoadingPolls = useRef(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [allPollsLoaded, setAllPollsLoaded] = useState(false);

    const pollRef = collection(db, 'poll');

    const filter = useRef(0);
    const filterChanged = useRef(true);

    const lastVisible = useRef(null);

    const flatListRef = useRef(null);

    const savedOrVotedPolls = async () => {

      let collectionRef;

      if(isSavedPolls== 'true') collectionRef = collection(db, 'user', user.uid, 'saved_polls');
      if(isVotedPolls == 'true') collectionRef = collection(db, 'user', user.uid, 'voted_polls');

      const docSnap = await getDocs(collectionRef);
      let idArray = [];
      if(docSnap.docs.length > 0) {
        docSnap.forEach(doc => {
          idArray.push(doc.data().poll_id);
        })
      }

      return idArray;
    }

    const checkAdditionalQuery = async (q) => {

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

    const fetchHotPolls = async () => {
      try {
        let q;
        const last30min = (await getServerTimeMillis(db)) - 1800000;

        q = query(pollRef, 
          orderBy('start_at', 'desc'),
          where('start_at', '>=', last30min),
          orderBy('total_votes', 'desc'),
          where('total_votes', '>=', 14),
          limit(10));

        q = await checkAdditionalQuery(q);
        const docSnap = await getDocs(q);

        if(docSnap.docs.length > 0) {
          lastVisible.current = docSnap.docs[docSnap.docs.length-1];
        }

        return docSnap.docs;
      }
      catch(e) {
        console.error("Error when loading hot polls: ", e);
      }
    }

    const fetchVotingClosedPolls = async () => {
      try {
        const serverTime = await getServerTimeMillis(db);
        let q;
        
        q = query(pollRef,
          orderBy('start_at', 'desc'),
          where('expires_at', '<=', serverTime),
          limit(10));
        
        q = await checkAdditionalQuery(q);
        
        const docSnap = await getDocs(q);
        
        if(docSnap.docs.length > 0) {
          lastVisible.current = docSnap.docs[docSnap.docs.length-1];
        }

        return docSnap.docs;

      }
      catch(e) {
        console.error("Error when loading voting closed polls: ", e);
      }
    }

    const fetchVotingOpenPolls = async () => {
      try {
        const serverTime = await getServerTimeMillis(db);
        let q;

        q = query(pollRef,
          orderBy('expires_at'),
          where('expires_at', '>', serverTime),
          limit(10));

        q = await checkAdditionalQuery(q);

        const docSnap = await getDocs(q);
        
        if(docSnap.docs.length > 0) {
          lastVisible.current = docSnap.docs[docSnap.docs.length-1];
        }

        return docSnap.docs;

      }
      catch(e) {
        console.error("Error when loading voting open polls: ", e);
      }
    }

    const startPollCountDown = (poll) => {
      const stopCountDown = startCountDown(poll.start_at, poll.seconds, (remaining)=>{
      setTimeLeft(prev => ({...prev, [poll.id]: timeToString(remaining, false)})); })  

      return stopCountDown;
    }

   const subLiveVotes = (id) => {
    try {
      let leftVotesTemp;
      let rightVotesTemp;
      const unsub = onSnapshot(doc(pollRef, id), (docSnap) => {
          leftVotesTemp = docSnap.data().left_votes;
          rightVotesTemp = docSnap.data().right_votes;
          setLeftVotes(prev => ({...prev, [id]: leftVotesTemp}));
          setRightVotes(prev => ({...prev, [id]: rightVotesTemp}));
      })

      return unsub;
    }
    catch(e) {
      console.error("Error when subLiveVotes(): ", e);
    }
   }

   const viewablePollsRef = useRef(new Set());
   const viewablePollSubsRef = useRef({});

   const onViewableItemsChanged = useRef(({viewableItems}) => {
      const newItems = new Set(viewableItems.map(item => item.item));

      newItems.forEach(item => {
        const id = item.id;

        if(!viewablePollsRef.current.has(item)) {

          viewablePollsRef.current.add(item);

          const unsub = subLiveVotes(id);
          viewablePollSubsRef.current[id] = unsub;

          const stopCountDown = startPollCountDown(item);
          countDownStopFunctions.current[id] = stopCountDown;
        }
      })

      viewablePollsRef.current.forEach(item => {

        if(!newItems.has(item)) {
          const id = item.id;

          viewablePollsRef.current.delete(item);

          viewablePollSubsRef.current[id]();
          delete viewablePollSubsRef.current[id];

          countDownStopFunctions.current[id]();
          delete countDownStopFunctions.current[id];
        }
      })

      //console.log(Object.keys(countDownStopFunctions.current).length);
      //console.log(Object.keys(viewablePollSubsRef.current).length);

   }).current;

    const fetchNewPolls = async (isRefresh) => {
      try {
          //console.log("New polls loading");
          let docs = [];

          if(isRefresh || filterChanged.current) {
            lastVisible.current = null;
          }

          switch(filter.current) {

            case 0:
              docs = await fetchHotPolls();
              break;
            case 1:
              docs = await fetchVotingOpenPolls();
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
              //console.log("No more polls to load (fetchNewestPolls)");
          }

          if(isSavedPolls == 'true' || isVotedPolls == 'true') {
            const idArray = new Set(await savedOrVotedPolls());
            docs = docs.filter(doc => idArray.has(doc.id));
          }

          const fetchedPolls = docs.map(doc => ({
            id: doc.id,
            postedAgo: timeToString( (Date.now() + serverTimeOffset) - doc.data().start_at, true ),
            ...doc.data()
          }))

          //fetchedPolls.forEach((fetchedPoll) => {
          //  startPollCountDown(fetchedPoll);
          //})

          if(fetchedPolls.length > 0) {
            setPolls(prev => [...prev, ...fetchedPolls]);
            setAllPollsLoaded(false);
          }
          
        }
        catch(e) {
          console.error("Error when fetching new polls: ", e);
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
        stopAllListeners();
      }

    }, [])

    const stopAllListeners = () => {

      // Live votes
      Object.values(viewablePollSubsRef.current).forEach(unsub => {
        if(unsub) unsub();
      });

      // Live timer
      Object.values(countDownStopFunctions.current).forEach(stopFn => {
        if (stopFn) stopFn();
      });

      countDownStopFunctions.current = {};
      viewablePollSubsRef.current = {};
    }

    const onRefresh = React.useCallback(async () => {

      if(isLoadingPolls.current || isRefreshing) {
        //console.log("Refresh not possible now");
        return;
      }

      //console.log("Reloading because refreshing");

      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      setIsRefreshing(true);
      await fetchNewPolls(true);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }, []);

    const onEndReached = async () => {

      if(isLoadingPolls.current || isRefreshing) {
        //console.log("OnEndReached() not possible now");
        return;
      }
      
      try {
        //if(polls.length >= 20) {
          //  setPolls([]);
          //}
        //console.log("Reloading because end reached");
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
          <ImageBackground source={backgrounds.baseBG} style={{flex: 1, justifyContent: 'center'}}>
              <ActivityIndicator size='large'/>
          </ImageBackground>
        )
    }

    const pollViewTitleComponent = (text, icon) => {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 20}}>
          {icon}
          <Text adjustsFontSizeToFit numberOfLines={1} style={{fontSize: deviceWidth/10, color: colors.red2, alignSelf: 'center'}}>
            {text}
          </Text>
          {icon}
        </View>
      )
    } 

    return (
      <ImageBackground source={backgrounds.baseBG} style={{flex: 1}}>

        <SafeAreaView style={{flex: 1}}>
          {isUserPolls == 'true' && pollViewTitleComponent("Your polls", <Entypo name="gauge" size={deviceWidth/10} color={colors.red1} />)}
          {isSavedPolls == 'true' && pollViewTitleComponent("Saved", <AntDesign name="star" size={deviceWidth/10} color={colors.orange} />)}
          {isVotedPolls == 'true' && pollViewTitleComponent("Voted", <Feather name="check-circle" size={deviceWidth/10} color={colors.red1} />)}
          {category != null && pollViewTitleComponent(mapCategory(category.toString()), null)}

          <View style={styles.sortingBar}>

            <SegmentedControl
              values={['Hot', 'Voting open', 'Voting closed']}
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
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{viewAreaCoveragePercentThreshold: 3}}
          decelerationRate={0.1}
          ListFooterComponent={
            <Button title={allPollsLoaded ? "Refresh page": "Load more"} onPress={async ()=>{
              //console.log("Load more Button triggered"); 
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
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={{fontSize: deviceWidth/26, color: colors.red1, fontWeight: 'bold'}}>{item.username}</Text>
                          <Text style={{fontSize: deviceWidth/36, color: 'black'}}> posted in </Text>
                          <Text style={{fontSize: deviceWidth/26, color: colors.red2}}>{mapCategory(item.category)}</Text>
                        </View>
                        <Text style={{fontSize: 11, color: 'black'}}>{item.postedAgo} ago</Text>
                      </View>
                      <View style={styles.textContainer} >
                        <Text numberOfLines={Math.floor(deviceHeight/150)} style={{fontSize: 20, color: 'black'}} >{item.title}</Text>
                      </View>
                      <View style={styles.gaugeContainer}>
                        <Gauge
                          gaugeWidth={deviceWidth/2}
                          gaugeHeight={(deviceWidth/2)/2.3}
                          gaugeRadius={(deviceWidth/2)*0.25}
                          leftLabel={item.left_label}
                          rightLabel={item.right_label}
                          leftVotes={leftVotes[item.id]}
                          rightVotes={rightVotes[item.id]}
                        />
                        <View style={styles.timeLeftContainer}>
                          <AntDesign name="clockcircleo" size={deviceWidth/20} color="black" />
                          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.timeLeftText}>
                            {timeLeft[item.id] != '0sec' ? timeLeft[item.id] + ' left': " Voting closed!"}
                          </Text>
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
      height: 80,
      width: '100%',
      backgroundColor: colors.yellow,
      padding: 20
    },
    postContainer: {
      backgroundColor: 'rgba(255,0,0,0.05)',
      borderBottomWidth: 1,
      borderColor: 'gray',
      height: deviceHeight/2,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      //backgroundColor: 'green',
    },
    postContentContainer: {
      justifyContent: 'space-between',
      //backgroundColor: 'yellow',
      width: deviceWidth - 40
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
      height: deviceHeight/5,
      borderWidth: 2,
      borderRadius: 10,
      borderColor: colors.orange,
      width: '100%',
      alignSelf: 'center'
      //backgroundColor: 'pink',
    },
    gaugeContainer: {
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '100%',
      padding: 5,
      flexDirection: 'row',
      marginTop: 15,
     // backgroundColor: 'white',
    },
    timeLeftContainer: {
      width: deviceWidth/3,
      height: deviceHeight/10,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems:'center',
    },
    timeLeftText: {
      textAlignVertical: 'center',
      fontSize: 18,
      color: 'black',
      fontSize: deviceWidth/20
    }
  });