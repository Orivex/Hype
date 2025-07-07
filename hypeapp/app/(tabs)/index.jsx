import { FlatList, Image, ImageBackground, Pressable, StyleSheet } from "react-native";
import categories from "../helper/categories";
import { View, Text } from "react-native";
import Background from "../helper/backgrounds";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import backgrounds from "../helper/backgrounds";

export default function Categories() {

    const router = useRouter();

    return (

        <ImageBackground source={backgrounds.baseBG} style={{flex: 1}}>
          <SafeAreaView style={{justifyContent: 'center', alignItems: 'center'}}>
            <FlatList 
                data={categories}
                keyExtractor={(item) => item.value}
                style={{width: '90%'}}
                contentContainerStyle={styles.contentContainer}            
                renderItem={({item}) => (
                  <Pressable onPress={()=>{router.push({
                    pathname: '/(pollView)',
                    params: item
                  });   console.log("Passed: ", item.value);}}>
                    <View style={styles.categoryContainer} >
                        <ImageBackground style={styles.image} source={item.imagePath}>
                            <Text style={styles.labelText} >{item.label}</Text>
                        </ImageBackground>
                    </View>
                  </Pressable>

                )}
            />
          </SafeAreaView>

        </ImageBackground>

    )
}

const styles = StyleSheet.create({
  contentContainer: {
   // flex: 1,
    //backgroundColor: 'white',
    justifyContent: 'center',
  },
  categoryContainer: {
    borderWidth: 1,
    borderRadius: 20,
    width: '100%',
    height: 100,
    marginVertical: 15,
    overflow: 'hidden'
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  labelText: {
    color: 'white',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 5,
    fontSize: 30,
    textShadowColor: 'black',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 10,
    textAlign: 'center'
  }
});