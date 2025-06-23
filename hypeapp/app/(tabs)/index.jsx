import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Gauge from '../helper/Gauge';

const Post = () => {
  const [no, setNo] = useState(0);
  const [yes, setYes] = useState(0);
  const router = useRouter();
  return (  
      <Pressable onPress={()=>{router.push('/create')}}>
    <View style={styles.postContainer}>
        <View style={styles.postContentContainer}>
          <Text style={{fontSize: 14, color: 'gray'}}>GameMaster69</Text>
          <Text style={{fontSize: 10}}>Football ⚽</Text>
          <Text>Was that a foul? Vote to tell me what do you think! BLABLABLABLABLABLABLABLA</Text>
        </View>

        <Gauge no={no} yes={yes}></Gauge>
    </View>
      </Pressable>
  )
}

export default function App() {



  return (

    <SafeAreaView style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
        <Post/>
    </SafeAreaView>

  )

}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'gray',
    borderRadius: 20,
    height: 125,
    width: '95%',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row'
  },
  postContentContainer: {
    width: 150,
    justifyContent: 'center',
  }
});