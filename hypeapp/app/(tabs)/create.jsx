import { HelloWave } from "@/components/HelloWave";
import { SafeAreaView, StyleSheet, TextInput } from "react-native";


export default function Create() {

    return(

        <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <TextInput style={styles.textInput} placeholder="Title/Question/Comment" placeholderTextColor={'gray'}/>
            <TextInput style={styles.textInput} placeholder="Left side of gauge" placeholderTextColor={'gray'}/>
            <TextInput style={styles.textInput} placeholder="Right side of gauge" placeholderTextColor={'gray'}/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    textInput: {
        fontSize: 20,
        color: 'white',
        borderWidth: 2,
        borderColor: 'gray',
        borderRadius: 10,
        width: 300
    }
})