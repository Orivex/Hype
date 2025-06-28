import { HelloWave } from "@/components/HelloWave";
import { Alert, Button, StyleSheet, TextInput } from "react-native";
import DropdownComponent from "../helper/DropdownComponent";
import { collection, doc, getFirestore, setDoc } from "@react-native-firebase/firestore";
import { useState } from "react";
import { getAuth } from "@react-native-firebase/auth";
import { SafeAreaView } from 'react-native-safe-area-context';


const BaseTextInput = ({value, setValue, placeholder}) => {
        return(
            <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor='gray'
            style={styles.textInput}
            />
    )
}


export default function Create() {

    const db = getFirestore();
    const pollRef = collection(db, 'poll');

    const createPoll = async ({uid, title, category, leftLabel, rightLabel }) => { //, duration, available_time}) => {
        try {
            const poll = {
                uid: uid,
                title: title,
                category: category,
                leftLabel: leftLabel,
                rightLabel: rightLabel,
                leftVotes: 0,
                rightVotes: 0,
                has_ended: false,
                //available_time: available_time
            }
            const docRef = doc(pollRef);
            await setDoc(docRef, poll);

            setTitle('');
            setCategory('');
            setLeftLabel('');
            setRightLabel('');
            setDuration('');
            Alert.alert("Poll created!")
        }
        catch(error) {
            console.error("Creating poll didn't work: ", error)
        }
    }

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [leftLabel, setLeftLabel] = useState('');
    const [rightLabel, setRightLabel] = useState('');
    const [duration, setDuration] = useState(0);

    return(
        <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>

            <BaseTextInput value={title} setValue={setTitle} placeholder={'Title'} />

            <DropdownComponent
            value={category}
            onChange={setCategory}
            />

            <BaseTextInput value={leftLabel} setValue={setLeftLabel} placeholder={'Left side of gauge'} />
            <BaseTextInput value={rightLabel} setValue={setRightLabel} placeholder={'Right side of gauge'} />
            <BaseTextInput value={duration} setValue={setDuration} placeholder={'Duration'} />


            <Button title="Create" onPress={()=>{
                
                const uid = getAuth().currentUser.uid;

                createPoll({uid, title, category, leftLabel, rightLabel})
                
                }} ></Button>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    textInput: {
        fontSize: 20,
        color: 'gray',
        borderWidth: 2,
        borderColor: 'gray',
        borderRadius: 10,
        width: 300,
        marginVertical: 10,
        paddingLeft: 12,
    }
})