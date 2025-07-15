import { useLocalSearchParams } from "expo-router"
import Gauge from "../../helper/Gauge";
import Background from "../../helper/backgrounds";
import { ActivityIndicator, Alert, Button, Dimensions, ImageBackground, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { mapCategory } from "../../helper/categories";
import { useEffect, useRef, useState } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, increment, onSnapshot, query, setDoc, updateDoc, where } from "@react-native-firebase/firestore";
import { startCountDown } from "../../helper/DurationCountDown";
import backgrounds from "../../helper/backgrounds";
import { useUser } from "@/app/context/UserContext";
import colors from "@/app/helper/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';
import { timeToString } from "@/app/helper/timeToString";
import Ionicons from '@expo/vector-icons/Ionicons';
import deviceSizes from "@/app/helper/deviceSizes";

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default function Vote() {

    
    const poll = useLocalSearchParams();
    const {user} = useUser(); 

    const db = getFirestore();
    const pollRef = collection(db, 'poll');
    const userRef = collection(db, 'user');
    const docRef = doc(pollRef, poll.id);

    //Realtime updates
    const [leftVotes, setLeftVotes] = useState(0); 
    const [rightVotes, setRightVotes] = useState(0);
    const [totalVotes, setTotalVotes] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [startAt, setStartAt] = useState(null);
    
    const [isLoading, setIsLoading] = useState(true); 

    const fetchVotes = () => {
        const unsub = onSnapshot(docRef, (docSnap) => {
            if(docSnap.exists()) {
                const data = docSnap.data();
                setLeftVotes(data.left_votes);
                setRightVotes(data.right_votes);
                setTotalVotes(data.total_votes);
            }
        });

        return unsub;
    }

    const gainHype = async (name) => {
        try {
            const docSnap = await getDocs(query(userRef, where('name', '==', name)));
            if(!docSnap.empty) {
                const docRef = docSnap.docs[0].ref;
                await updateDoc(docRef, {hype_score: increment(1)});
            }
        }
        catch(e) {
            console.error("Error when gainHype: ", e);
        }
    }

    const voteForPoll = async (side) => {

        //if(pollVoteRef.current) return;

        try{
            pollVoteRef.current = true; // Directly disables voteButtons

            const docSnap = await getDoc(docRef);
            const data = docSnap.data();
            
            if(side == 'left') {
                await updateDoc(docRef, {left_votes: increment(1), total_votes: increment(1)})
                await setDoc(votedPollRef, {vote: 'left', ...data});
                setPollVote('left');
            }
            else if (side == 'right') {
                await updateDoc(docRef, {right_votes: increment(1), total_votes: increment(1)})
                await setDoc(votedPollRef, {vote: 'right', ...data});
                setPollVote('right');
            }


            if((data.left_votes + data.right_votes) % 1 == 0) { // Every vote => one point (will be changed in release)
                gainHype(poll.username); // Give it to the guy who posted the poll
            }

            gainHype(user.displayName); 
        }
        catch(e){
            const msg = 'Something went wrong when voting: ';
            console.error(msg, e);
            Alert.alert(msg);
        }
    }

    const fetchStartAt = async () => {
        const docSnap = await getDoc(doc(pollRef, poll.id));
        if(docSnap.exists()) {
            setStartAt(docSnap.data().start_at);
        }
    }

    const savedPollRef = doc(db, 'user', user.uid, 'saved_polls', poll.id);
    const [isPollSaved, setIsPollSaved] = useState(null);
    const votedPollRef = doc(db, 'user', user.uid, 'voted_polls', poll.id);
    const [pollVote, setPollVote] = useState(null);
    const pollVoteRef = useRef(false); // Used to make the animation faster

    const pollSaved = async () => {
        try {
            const docSnap = await getDoc(savedPollRef);
            docSnap.exists() ? setIsPollSaved(true): setIsPollSaved(false);
        }
        catch(e) {
            console.error("Error when pollSaved(): ", e);
        }
    }

    const pollVoted = async () => {
        try {
            const docSnap = await getDoc(votedPollRef);
            if(docSnap.exists()) {
                setPollVote(docSnap.data().vote);
                pollVoteRef.current = true;
            }
        }
        catch(e) {
            console.error("Error when pollVoted(): ", e);
        }
    }

    const savePoll = async () => {
        try {
            if(isPollSaved) {
                await deleteDoc(savedPollRef);
                setIsPollSaved(false);
            }
            else if (!isPollSaved) {
                const docSnap = await getDoc(docRef);
                if(docSnap.exists()) {
                    await setDoc(savedPollRef, docSnap.data());
                    setIsPollSaved(true);
                    Alert.alert("Poll saved");
                }
            }
        }
        catch(e) {
            console.error("Error when savePoll(): ", e);
        }
    }


    useEffect(()=> {

        let unsubVotes;

        const loadData = async () => {
            try {
                await fetchStartAt();
                await pollSaved();
                await pollVoted();
                unsubVotes = fetchVotes();
            }
            catch(e) {
                console.error("Error when loading data: ", e);
            }
            finally {
                setIsLoading(false);
            }
        }

        loadData();

        return () => {
            if(unsubVotes) unsubVotes();
        };    
    }, [])

    useEffect(()=> {

        if(!isLoading) {
            const stopCountDown = startCountDown(startAt, poll.seconds, (remaining) => {setTimeLeft(timeToString(remaining,false))});
            return () => {
                if(stopCountDown) stopCountDown();
            }
        }

    }, [isLoading])



    if(isLoading || timeLeft == null) {
        return(
            <ImageBackground source={backgrounds.baseBG} style={{flex: 1, justifyContent: 'center'}}>
                <ActivityIndicator size='large'/>
            </ImageBackground>
        )
    }

    return(

        <ImageBackground source={backgrounds.baseBG} style={{flex: 1}}>
            <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
                <View style={{flexDirection: 'row', marginTop: 50}}>
                    <Text style={{fontSize: 20, color: colors.red1, fontWeight: 'bold'}}>{poll.username}</Text>
                    <Text style={{fontSize: 18, color: 'black'}}> posted in </Text>
                    <Text style={{fontSize: 20, color: colors.red2}}>{mapCategory(poll.category)}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text adjustsFontSizeToFit numberOfLines={10} style={styles.titleText}>{poll.title}</Text>
                    <Pressable style={{alignSelf: 'flex-end'}} onPress={async ()=>{await savePoll();}}>
                        <AntDesign name={isPollSaved ? 'star': 'staro'} size={30} color={colors.orange} />
                    </Pressable>
                </View>

                <Gauge
                    preview={false}
                    gaugeWidth={deviceWidth}
                    gaugeHeight={deviceWidth/2.3}
                    gaugeRadius={deviceWidth*0.25}
                    leftVotes={parseInt(leftVotes)}
                    rightVotes={parseInt(rightVotes)}
                    leftLabel={poll.left_label}
                    rightLabel={poll.right_label}
                    />

                {poll.username != user.displayName ? (
                    <>
                        <View style={styles.voteContainer}>
                            <TouchableOpacity 
                                disabled={ timeLeft == '0sec'}
                                style={[styles.voteButtonStyle, (pollVoteRef.current || timeLeft == '0sec') && styles.voteButtonDisabled]}
                                onPress={()=>{voteForPoll('left')}}>
                                
                                <Ionicons name="arrow-back-circle-outline" size={deviceWidth/5}
                                color={pollVote == 'left' ? 'green': colors.red1} />
                            </TouchableOpacity >
                            <TouchableOpacity 
                                disabled={ timeLeft == '0sec'}
                                style={[styles.voteButtonStyle, (pollVoteRef.current || timeLeft == '0sec') && styles.voteButtonDisabled]}
                                onPress={()=>{voteForPoll('right')}}
                                >
                            
                                <Ionicons name="arrow-forward-circle-outline" size={deviceWidth/5} 
                                color={pollVote == 'right' ? 'green': colors.red1} />
                            </TouchableOpacity >
                        </View>
                    </>
                ):
                <>

                </>

            }
            <View style={styles.infoContainer2}>
                <Text style={styles.timeLeftText}>{timeLeft != '0sec' ? timeLeft + " left": "Voting closed!"}</Text>
                <Text style={styles.usersVotedText}
                adjustsFontSizeToFit
                numberOfLines={1}
                >🔥 {totalVotes} votes 🔥</Text>
            </View>
            </SafeAreaView>

        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    voteContainer: {
        flexDirection: 'row',
        marginTop: 30,
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    voteButtonStyle: {
        elevation: 15,
        backgroundColor: colors.yellow,
        borderRadius: 100,
    },
    voteButtonDisabled: {
        backgroundColor: colors.yellow,
        opacity: 0.3,
        borderRadius: 40,
    },
    infoContainer: {
        padding: 10,
        width: '90%',
        height: '30%',
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: colors.red2,
        justifyContent: 'space-between',
        marginBottom: 30
        //backgroundColor: 'white',
    },
    titleText: {
        fontSize: 25 * deviceSizes.deviceWidth/100,
    },
    categoryText: {
        fontSize: 14,
    },
    infoContainer2: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30
    },
    timeLeftText: {
        fontSize: deviceWidth/15,
    },
    usersVotedText: {
        fontSize: deviceWidth/10,
        width: '90%',
        padding: 5,
        borderWidth: 2,
        borderColor: colors.red2,
        borderRadius: 10,
        textAlign: 'center'
    }
})