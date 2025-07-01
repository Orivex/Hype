import { useLocalSearchParams } from "expo-router"
import Gauge from "../helper/Gauge";
import Background from "../helper/Background";
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from "react-native";
import { mapCategory } from "../helper/categories";
import { useEffect, useRef, useState } from "react";
import { collection, doc, getDoc, getFirestore, increment, onSnapshot, serverTimestamp, setDoc, Timestamp, updateDoc } from "@react-native-firebase/firestore";
import { estimateServerTimeOffeset, startCountDown } from "../helper/DurationCountDown";
import { getAuth } from "@react-native-firebase/auth";


export default function Vote() {
    
    const {id} = useLocalSearchParams();

    const db = getFirestore();
    const pollRef = collection(db, 'poll');
    const userRef = collection(db, 'user');
    const docRef = doc(pollRef, id);

    //Realtime updates
    const [leftVotes, setLeftVotes] = useState(0); 
    const [rightVotes, setRightVotes] = useState(0);
    const [totalVotes, setTotalVotes] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    //static poll info. Changes not possible
    const [poll, setPoll] = useState({});
    
    const [isLoading, setIsLoading] = useState(true); 

    const [serverTimeOffset, setServerTimeOffset] = useState(null);

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

    const fetchPollInfo = async () => {
        try {
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()) {
                setPoll({...docSnap.data()})
            }
        }
        catch(e) {
            console.error("Error when fetching poll info: ", e);
        }
    }

    const gainHype = async (id) => {
        try {

            const docRef = doc(userRef, id);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()) {
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
                gainHype(poll.uid); // Give it to the guy who posted the poll
            }

            gainHype(getAuth().currentUser.uid); 

            fetchVotes();
        }
        catch(e){
            const msg = 'Something went wrong when voting: ';
            console.error(msg, e);
            Alert.alert(msg);
        }
    }

    useEffect(()=> {

        let unsubVotes;

        const loadData = async () => {
            try {
                setServerTimeOffset(await estimateServerTimeOffeset(db));
                await fetchPollInfo();

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
            const stopCountDown = startCountDown(poll.start_at, poll.seconds, serverTimeOffset, (remaining) => {setTimeLeft(remaining)});
            return () => {
                if(stopCountDown) stopCountDown();
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

    return(

        <Background>
            <View>
                <Text>Title: {poll.title}</Text>
                <Text>Category: {mapCategory(poll.category)}</Text>
                <Text>Duration: {timeLeft != 0 ? timeLeft: "Voting closed!"}</Text>
                <Text>🔥 {totalVotes} users voted 🔥</Text>
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

            {poll.uid != getAuth().currentUser.uid ? (
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
                        <Text>
                            Voting closed!
                        </Text>
                    </>
                
                }
                </>
            ):
            <>
                <Text>You can't vote for your own polls!</Text>
            </>
            
            }


        </Background>
    )
}

const styles = StyleSheet.create({
    voteContainer: {
        flexDirection: 'row',
        marginTop: 30,
        justifyContent: 'space-around',
        width: '100%'
    }
})