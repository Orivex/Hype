import { useLocalSearchParams } from "expo-router"
import Gauge from "../helper/Gauge";
import Background from "../helper/Background";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import { mapCategory } from "../helper/categories";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getFirestore, onSnapshot, updateDoc } from "@react-native-firebase/firestore";


export default function Vote() {
    
    const item = useLocalSearchParams();

    const db = getFirestore();
    const pollRef = collection(db, 'poll');
    const docRef = doc(pollRef, item.id);

    const [leftVotes, setLeftVotes] = useState(item.left_votes); 
    const [rightVotes, setRightVotes] = useState(item.right_votes); 

    const fetchVotes = () => {
        const unsub = onSnapshot(docRef, (docSnap) => {
            if(docSnap.exists()) {
                setLeftVotes(docSnap.data().left_votes);
                setRightVotes(docSnap.data().right_votes);
            }
        });

        return unsub;
    }

    const voteForPoll = async (side) => {
        try{
            const docSnap = await getDoc(docRef);
            const data = docSnap.data();
            
            if(side == 'left') {
                await updateDoc(docRef, {left_votes: data.left_votes+1})
            }
            else if (side == 'right') {
                await updateDoc(docRef, {right_votes: data.right_votes+1})
            }

            fetchVotes();
        }
        catch(e){
            const msg = 'Something went wrong when voting: ';
            console.error(msg, e);
            Alert.alert(msg);
        }
    }

    useEffect(()=> {

        const unsub = fetchVotes();

        return () => unsub ?? unsub();

    }, [])

    return(
        <Background>
            <View>
                <Text>Title: {item.title}</Text>
                <Text>Category: {mapCategory(item.category)}</Text>
                <Text>Duration: {item.duration}</Text>
                <Text>🔥 {(leftVotes+rightVotes)} users voted 🔥</Text>
            </View>


            <Gauge
                preview={false}
                gaugeWidth={400}
                gaugeHeight={200}
                gaugeRadius={150}
                pointerLength={30}
                leftVotes={parseInt(leftVotes)}
                rightVotes={parseInt(rightVotes)}
                leftLabel={item.left_label}
                rightLabel={item.right_label}
                />

            <View style={styles.voteContainer}>
                <Button title='Left' onPress={()=>{voteForPoll('left');}}/>
                <Button title='Right' onPress={()=>{voteForPoll('right');}} />
            </View>
            <View style={styles.voteContainer}>
                <Text>{leftVotes}</Text>
                <Text>{rightVotes}</Text>
            </View>
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