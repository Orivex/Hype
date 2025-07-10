import { useLocalSearchParams } from "expo-router"
import Gauge from "../../helper/Gauge";
import Background from "../../helper/backgrounds";
import { ActivityIndicator, Alert, Button, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { mapCategory } from "../../helper/categories";
import { useEffect, useRef, useState } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, increment, onSnapshot, query, setDoc, updateDoc, where } from "@react-native-firebase/firestore";
import { startCountDown } from "../../helper/DurationCountDown";
import backgrounds from "../../helper/backgrounds";
import { useUser } from "@/app/context/UserContext";
import colors from "@/app/helper/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';


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
                const fetchedLeftVotes = data.left_votes;
                const fetchedRightVotes = data.right_votes;
                setLeftVotes(fetchedLeftVotes);
                setRightVotes(fetchedRightVotes);
                setTotalVotes(fetchedLeftVotes+fetchedRightVotes);
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
        try{
            const docSnap = await getDoc(docRef);
            const data = docSnap.data();
            
            if(side == 'left') {
                await updateDoc(docRef, {left_votes: increment(1)})
            }
            else if (side == 'right') {
                await updateDoc(docRef, {right_votes: increment(1)})
            }

            if((data.left_votes + data.right_votes) % 1 == 0) { // Every vote => one point (will be changed in release)
                gainHype(poll.username); // Give it to the guy who posted the poll
            }

            gainHype(user.displayName); 

            fetchVotes();
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

    const pollSaved = async () => {
        try {
            const docSnap = await getDoc(savedPollRef);
            docSnap.exists() ? setIsPollSaved(true): setIsPollSaved(false);
        }
        catch(e) {
            console.error("Error when pollSaved(): ", e);
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
            const stopCountDown = startCountDown(startAt, poll.seconds, (remaining) => {setTimeLeft(remaining)});
            return () => {
                if(stopCountDown) stopCountDown();
            }
        }

    }, [isLoading])



    if(isLoading || timeLeft == null) {
        return(
            <ImageBackground source={backgrounds.hypeBG} style={{flex: 1, justifyContent: 'center'}}>
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
                    <Text adjustsFontSizeToFit numberOfLines={6} style={styles.titleText}>{poll.title}</Text>
                    <Pressable style={{alignSelf: 'flex-end'}} onPress={async ()=>{await savePoll();}}>
                        <AntDesign name={isPollSaved ? 'star': 'staro'} size={30} color={colors.orange} />
                    </Pressable>
                </View>

                <Gauge
                    preview={false}
                    gaugeWidth={400}
                    gaugeHeight={200}
                    gaugeRadius={150}
                    pointerLength={30}
                    leftVotes={parseInt(leftVotes)}
                    rightVotes={parseInt(rightVotes)}
                    leftLabel={poll.left_label}
                    rightLabel={poll.right_label}
                    />

                {poll.username != user.displayName ? (
                    <>
                    {timeLeft != 0 ? (
                        <>
                            <View style={styles.voteContainer}>
                                <Button title='Left' onPress={()=>{voteForPoll('left');}}/>
                                <Button title='Right' onPress={()=>{voteForPoll('right');}} />
                            </View>
                            <View style={styles.voteContainer}>
                                <Text>{leftVotes}</Text>
                                <Text>{rightVotes}</Text>
                            </View>
                        </>
                    ):
                    <>

                        </>
                    }
                    </>
                ):
                <>

                </>

            }
            <View style={styles.infoContainer2}>
                <Text style={styles.timeLeftText}>{timeLeft != 0 ? timeLeft + " left!": "Voting closed!"}</Text>
                <Text style={styles.usersVotedText}>🔥 {totalVotes} users voted 🔥</Text>
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
        width: '100%'
    },
    infoContainer: {
        padding: 10,
        width: '90%',
        height: '30%',
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: colors.red2,
        justifyContent: 'space-between',
        //backgroundColor: 'white',
    },
    titleText: {
        fontSize: 25,
    },
    categoryText: {
        fontSize: 14,
    },
    infoContainer2: {
        //backgroundColor: 'white',
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30
    },
    timeLeftText: {
        fontSize: 30,
    },
    usersVotedText: {
        fontSize: 35,
        width: '90%',
        padding: 5,
        borderWidth: 2,
        borderColor: colors.red2,
        borderRadius: 10,
        textAlign: 'center'
    }
})