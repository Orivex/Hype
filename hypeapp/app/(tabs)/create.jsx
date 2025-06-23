import { HelloWave } from "@/components/HelloWave";
import { Button, SafeAreaView, StyleSheet, TextInput } from "react-native";
import DropdownComponent from "../helper/DropdownComponent";


export default function Create() {

    return(
        <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <TextInput style={styles.textInput} placeholder="Title/Question/Comment" placeholderTextColor={'gray'}/>
            <DropdownComponent/>
            <TextInput style={styles.textInput} placeholder="Left side of gauge" placeholderTextColor={'gray'}/>
            <TextInput style={styles.textInput} placeholder="Right side of gauge" placeholderTextColor={'gray'}/>
            <Button title="add" onPress={()=>{console.log("ss")}} ></Button>
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
        width: 300,
        marginVertical: 10,
        paddingLeft: 12,
    }
})