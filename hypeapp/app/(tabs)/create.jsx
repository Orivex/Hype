import { HelloWave } from "@/components/HelloWave";
import { Alert, Button, StyleSheet, TextInput } from "react-native";
import DropdownComponent from "../helper/DropdownComponent";
import { collection, doc, getFirestore, setDoc } from "@react-native-firebase/firestore";
import { useState } from "react";
import { getAuth } from "@react-native-firebase/auth";
import { SafeAreaView } from 'react-native-safe-area-context';
import Background from "../helper/Background";


export default function Create() {

    const db = getFirestore();
    const pollRef = collection(db, 'poll');
    const emptyForm = {
        title: '',
        category: 0,
        leftLabel: '',
        rightLabel: '',
        duration: 0
    }

    const createPoll = async ({uid}) => {

        try {
            const poll = {
                uid: uid,
                title: form.title,
                category: form.category,
                left_label: form.leftLabel,
                right_label: form.rightLabel,
                left_votes: 0,
                right_votes: 0,
                has_ended: false,
                duration: form.duration
                //available_time: available_time
            }
            const docRef = doc(pollRef);
            await setDoc(docRef, poll);

            setForm(emptyForm);
            Alert.alert("Poll created!");
        }
        catch(error) {
            console.error("Creating poll didn't work: ", error);
        }
    }

    const [form, setForm] = useState(emptyForm);

    return(
        <Background>


            <TextInput
                value={form.title}
                onChangeText={(text) => setForm({...form, title: text})}
                placeholder='Title'
                placeholderTextColor='gray'
                style={styles.textInput}
            />

            <DropdownComponent
            value={form.category}
            onChange={(value) => setForm({ ...form, category: value })}
            />

            <TextInput
                value={form.leftLabel}
                onChangeText={(text) => setForm({...form, leftLabel: text})}
                placeholder='Left side of gauge'
                placeholderTextColor='gray'
                style={styles.textInput}
            />
            <TextInput
                value={form.rightLabel}
                onChangeText={(text) => setForm({...form, rightLabel: text})}
                placeholder='Right side of gauge'
                placeholderTextColor='gray'
                style={styles.textInput}
            />
            <TextInput
                value={form.duration}
                onChangeText={(text) => setForm({...form, duration: text})}
                placeholder='Duration'
                keyboardType="numeric"
                placeholderTextColor='gray'
                style={styles.textInput}
            />


            <Button title="Create" onPress={()=>{
                
                const uid = getAuth().currentUser.uid;

                if(!form.title.trim() || !form.leftLabel.trim() || !form.rightLabel.trim()) {
                    Alert.alert("Please fill in all text input fields.");
                }
                else if(form.category == 0) {
                    Alert.alert("Please choose a category.");
                }
                else if(form.duration < 1 || form.duration > 30) {
                    Alert.alert("Duration has to be at least 1min and maximum 30min.");
                }
                else {
                    createPoll({uid});
                }
                
                }}/>
        </Background>
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