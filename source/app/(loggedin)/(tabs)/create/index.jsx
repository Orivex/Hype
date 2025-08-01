import { useUser } from "@/app/context/UserContext";
import backgrounds from "@/app/helper/backgrounds";
import categories, { mapCategory } from "@/app/helper/categories";
import colors from "@/app/helper/colors";
import deviceSizes from "@/app/helper/deviceSizes";
import { getServerTimeMillis } from "@/app/helper/DurationCountDown";
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, doc, getFirestore, setDoc } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from "react-native-safe-area-context";

const deviceWidth = deviceSizes.deviceWidth;
const deviceHeight = deviceSizes.deviceHeight;

export default function Create() {

    const db = getFirestore();
    const router = useRouter();
    const {user} = useUser();
    const pollRef = collection(db, 'poll');
    const emptyForm = {
        title: '',
        category: 0,
        leftLabel: '',
        rightLabel: '',
        minutes: ''
    }

    const createPoll = async () => {

        try {
            const serverTime = await getServerTimeMillis(db);
            const minutes = parseInt(form.minutes);
            const poll = {
                username: user.displayName,
                title: form.title,
                category: form.category,
                left_label: form.leftLabel,
                right_label: form.rightLabel,
                left_votes: 0,
                right_votes: 0,
                total_votes: 0,
                seconds: minutes * 60,
                start_at: serverTime,
                expires_at: serverTime + minutes * 60 * 1000
            }

            //console.log(poll);
            const docRef = doc(pollRef);
            await setDoc(docRef, poll);

            Alert.alert("Poll created!");
            setForm(emptyForm);
            setDropdownCategory(null);
            setCurrentVisible(0);
            router.push({
                pathname: '/(pollView)/vote',
                params: { id: docRef.id, ...poll }
            })
        }
        catch(error) {
            console.error("Creating poll didn't work: ", error);
        }
    }

    const [form, setForm] = useState(emptyForm);
    const [currentVisible, setCurrentVisible] = useState(0);

    //Dropdown
    const [open, setOpen] = useState(false);
    const [dropdownCategory, setDropdownCategory] = useState(null);

    const items = useMemo(() => categories.map(item => ({
      label: item.label,
      value: item.value
    })), []);

    return(
        <ImageBackground source={backgrounds.baseBG} style={{flex: 1}}>
            <SafeAreaView style={{flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 60}}>

                {currentVisible == 0 && (
                    <View>
                        <Text style={styles.textStyle}>WHAT HAPPENED!?</Text>
                        <TextInput
                            value={form.title}
                            onChangeText={(text) => setForm({...form, title: text})}
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
                        <DropDownPicker
                            open={open}
                            value={dropdownCategory}
                            setValue={setDropdownCategory}
                            items={items}
                            setOpen={setOpen}
                            onChangeValue={(value) => setForm({...form, category: value})}
                            placeholder="Category"
                            listMode="SCROLLVIEW"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropDownContainer}
                            textStyle={{fontSize: 20}}
                            placeholderStyle={{fontSize: 20, color: 'gray'}}
                        />
                    </View>
                )}

                {currentVisible == 2 && (
                    <View>
                        <Text style={styles.textStyle}>Left side of the gauge (field 1)</Text>
                        <TextInput
                            value={form.leftLabel}
                            onChangeText={(text) => setForm({...form, leftLabel: text})}
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
                        style={styles.textInput}
                        maxLength={5}
                    />
                </View>
               )}

                {currentVisible == 4 && (
                    <View>
                        <Text style={styles.textStyle}>Voting time in minutes (1 - 180)</Text>
                        <TextInput
                            value={form.minutes}
                            onChangeText={(text) => setForm({...form, minutes: text})}
                            keyboardType="numeric"
                            style={styles.textInput}
                            numberOfLines={7}
                            maxLength={3}
                        />
                    </View>
                )}
                
                {currentVisible <= 5 && (
                    <View style={{width: '100%'}}>


                        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                            {currentVisible >= 1 && (
                                <TouchableOpacity onPress={()=> setCurrentVisible(prev => prev-1)}>
                                    <Ionicons name="arrow-back-outline" size={deviceWidth/10} color={colors.orange} />
                                </TouchableOpacity>
                            )}

                            {currentVisible <= 4 && (
                                <TouchableOpacity onPress={()=>{

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
                                            if(!form.minutes || form.minutes < 1 || form.minutes > 180) {
                                                Alert.alert("Duration has to be at least 1min and maximum 180min");
                                                alerted = true;
                                            }
                                        break;  
                                    }

                                    if(!alerted) setCurrentVisible(prev => prev+1);

                                    }}>
                                        <Ionicons name="arrow-forward-outline" size={deviceWidth/10} color={colors.orange} />
                                </TouchableOpacity>
                            )}

                            {currentVisible == 5 && (
                                <TouchableOpacity onPress={()=>{createPoll()}}>
                                    <Text style={styles.postText}>POST</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                            
                        {currentVisible == 5 && (
                            <ScrollView style={{}} contentContainerStyle={{paddingVertical: deviceHeight/15, alignItems: 'center' }}>
                            
                                <Text style={{fontSize: deviceWidth/10}}>Your poll</Text>
                                <Text style={{fontSize: deviceWidth/15, borderWidth: 2, borderColor: colors.orange, borderRadius: 10, padding: 20, margin: 10}}>{form.title}</Text>
                                <Text style={{fontSize: deviceWidth/30}}>{mapCategory(form.category)}</Text>

                                <View style={{flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                        <Ionicons name="arrow-back-circle-outline" size={deviceWidth/5} color={colors.red1} />
                                        <Text style={{fontSize: deviceWidth/20}}>{form.leftLabel}</Text>
                                    </View>

                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                        <Text style={{fontSize: deviceWidth/20}}>{form.rightLabel}</Text>
                                        <Ionicons name="arrow-forward-circle-outline" size={deviceWidth/5} color={colors.red1} />
                                    </View>
                                </View>
                                <AntDesign name="clockcircleo" size={deviceWidth/20} color="black" />
                                <Text style={{fontSize: deviceWidth/23}}>{form.minutes} minutes</Text>
                            
                            </ScrollView>
                        )}

                    </View>
                )}
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    postText: {
        fontSize: deviceWidth/20,
        borderWidth: 1,
        borderRadius: 100,
        padding: 10,
        width: deviceWidth/3,
        textAlign: 'center',
        backgroundColor: colors.orange05
    },
    textInput: {
        fontSize: 20,
        color: 'black',
        borderWidth: 2,
        borderColor: colors.orange,
        borderRadius: 10,
        width: deviceWidth - 40,
        textAlignVertical: 'top',
        marginVertical: 10,
        paddingLeft: 12,
    },
    textStyle: {
        fontSize: 20,
        fontStyle: 'italic'
    },
    dropdown: {
        backgroundColor: colors.yellow,
        borderWidth: 2,
        borderColor: colors.orange,
        width: deviceWidth - 40,
        marginVertical: 10,
        paddingLeft: 12,
    },
    dropDownContainer: {
        backgroundColor: colors.yellow,
        width: deviceWidth-40,
        borderWidth: 2,
        borderColor: colors.orange
    }
})