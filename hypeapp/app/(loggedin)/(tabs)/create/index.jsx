import { Alert, Button, ImageBackground, Modal, StyleSheet, TextInput, View, Text } from "react-native";
import DropdownComponent from "@/app/helper/DropdownComponent";
import { collection, doc, getFirestore, setDoc } from "@react-native-firebase/firestore";
import { useRef, useState } from "react";
import { getAuth } from "@react-native-firebase/auth";
import { getServerTimeMillis } from "@/app/helper/DurationCountDown";
import { SafeAreaView } from "react-native-safe-area-context";
import backgrounds from "@/app/helper/backgrounds";
import { useUser } from "@/app/context/UserContext";
import colors from "@/app/helper/colors";
import deviceSizes from "@/app/helper/deviceSizes"


export default function Create() {

    const db = getFirestore();
    const {user} = useUser();
    const pollRef = collection(db, 'poll');
    const emptyForm = {
        title: '',
        category: 0,
        leftLabel: '',
        rightLabel: '',
        minutes: 0
    }

    const createPoll = async () => {

        try {
            const serverTime = await getServerTimeMillis(db);
            const poll = {
                username: user.displayName,
                title: form.title,
                category: form.category,
                left_label: form.leftLabel,
                right_label: form.rightLabel,
                left_votes: 0,
                right_votes: 0,
                total_votes: 0,
                seconds: form.minutes * 60,
                start_at: serverTime,
                expires_at: serverTime + form.minutes * 60 * 1000
            }
            const docRef = doc(pollRef);
            await setDoc(docRef, poll);

            setForm(emptyForm);
            setCurrentVisible(0);
            Alert.alert("Poll created!");
        }
        catch(error) {
            console.error("Creating poll didn't work: ", error);
        }
    }

    const [form, setForm] = useState(emptyForm);
    const [currentVisible, setCurrentVisible] = useState(0);

    return(
        <ImageBackground source={backgrounds.baseBG} style={{flex: 1}}>
            <SafeAreaView style={{justifyContent: 'center', alignItems: 'center', marginTop: 60}}>

                {currentVisible == 0 && (
                    <View>
                        <Text style={styles.textStyle}>WHAT HAPPENED?</Text>
                        <TextInput
                            value={form.title}
                            onChangeText={(text) => setForm({...form, title: text})}
                            placeholder='Title'
                            placeholderTextColor='gray'
                            style={[styles.textInput, {height: deviceSizes.deviceHeight/4}]}
                            maxLength={400}
                            multiline
                            numberOfLines={8}
                        />
                    </View>
                )}

                {currentVisible == 1 && (
                    <View>
                        <Text style={styles.textStyle}>Select a category</Text>
                        <DropdownComponent
                            value={form.category}
                            onChange={(value) => setForm({ ...form, category: value })}
                            style={styles.dropdown}
                            />
                    </View>
                )}

                {currentVisible == 2 && (
                    <View>
                        <Text style={styles.textStyle}>Left side of the gauge (field 1)</Text>
                        <TextInput
                            value={form.leftLabel}
                            onChangeText={(text) => setForm({...form, leftLabel: text})}
                            placeholder='Left side of gauge'
                            placeholderTextColor='gray'
                            style={styles.textInput}
                            maxLength={5}
                        />
                    </View>
                )}

               {currentVisible == 3 && (
                <View>
                    <Text style={styles.textStyle}>Right side of the gauge (field 2)</Text>
                    <TextInput
                        value={form.rightLabel}
                        onChangeText={(text) => setForm({...form, rightLabel: text})}
                        placeholder='Right side of gauge'
                        placeholderTextColor='gray'
                        style={styles.textInput}
                        maxLength={5}
                    />
                </View>
               )}

                {currentVisible == 4 && (
                    <View>
                        <Text style={styles.textStyle}>How long can users vote?</Text>
                        <TextInput
                            value={form.minutes}
                            onChangeText={(text) => setForm({...form, minutes: parseInt(text)})}
                            placeholder='Duration in minutes'
                            keyboardType="numeric"
                            placeholderTextColor='gray'
                            style={styles.textInput}
                            numberOfLines={7}
                            maxLength={2}
                        />
                    </View>
                )}
                
                {currentVisible <= 5 && (
                    <View style={{flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>


                        {currentVisible >= 1 && (
                            <Button title="Back" onPress={()=>{
                                setCurrentVisible(prev => prev-1);
                            }}/>
                        )}

                        {currentVisible <= 4 && (
                            <Button title="Next" onPress={()=>{
                            let alerted = false;
                            switch(currentVisible){
                                case 0:
                                    if(form.title.trim().length <= 20) {
                                        Alert.alert('At least 20 characters');
                                        alerted = true;
                                    }
                                break;

                                case 1: 
                                    if(form.category == 0) {
                                        Alert.alert('Please choose a category');
                                        alerted = true;
                                    }
                                break;

                                case 2:
                                    if(form.leftLabel.trim().length == 0) {
                                        Alert.alert('At least 1 character');
                                        alerted = true;
                                    }
                                break;

                                case 3:
                                    if(form.rightLabel.trim().length == 0) {
                                        Alert.alert('At least 1 character');
                                        alerted = true;
                                    }
                                break;

                                case 4:
                                    if(!form.minutes || form.minutes < 1 || form.minutes > 60) {
                                        Alert.alert("Duration has to be at least 1min and maximum 60min");
                                        alerted = true;
                                    }
                                break;  
                            }

                            if(!alerted) setCurrentVisible(prev => prev+1);
                            }}/>
                        )}

                        {currentVisible == 5 && (
                            <View>
                                <Text>Title: {form.title}</Text>
                                <Text>Category: {form.category}</Text>
                                <Text>Left label: {form.leftLabel}</Text>
                                <Text>Right label: {form.rightLabel}</Text>
                                <Text>Duration in minutes: {form.minutes}</Text>
                                <Button title="Create" onPress={()=>{
                                    createPoll();
                                }}/>
                            </View>
                        )}

                    </View>
                )}
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    textInput: {
        fontSize: 20,
        color: 'black',
        borderWidth: 2,
        borderColor: colors.orange,
        borderRadius: 10,
        width: deviceSizes.deviceWidth - 40,
        textAlignVertical: 'top',
        marginVertical: 10,
        paddingLeft: 12,
    },
    textStyle: {
        fontSize: 20,
        fontStyle: 'italic'
    },
    dropdown: {
        height: 50,
        width: deviceSizes.deviceWidth - 40,
        borderRadius: 10,
        borderColor: colors.orange,
        borderWidth: 2,
        marginVertical: 10,
        paddingLeft: 10,

        item: {
            padding: 17,
            flexDirection: 'row',
            alignItems: 'center',
        },
        textItem: {
            fontSize: 14,
            color: 'gray',
        },
        placeholderStyle: {
          fontSize: 20,
          color: 'gray',
        },
        selectedTextStyle: {
          fontSize: 20,
          color: 'black',
        },
        inputSearchStyle: {
          height: 40,
          fontSize: 16,
        },
    },
})