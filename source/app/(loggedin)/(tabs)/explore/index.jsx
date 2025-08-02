import backgrounds from "@/app/helper/backgrounds";
import categories from "@/app/helper/categories";
import colors from "@/app/helper/colors";
import deviceSizes from "@/app/helper/deviceSizes";
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from "expo-router";
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const deviceWidth = deviceSizes.deviceWidth;
const deviceHeight = deviceSizes.deviceHeight;

export default function Categories() {

    const router = useRouter();

    return (

        <ImageBackground source={backgrounds.baseBG} style={{flex: 1}}>
          <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity style={styles.pollButton} onPress={()=>{router.push({
              pathname: '/(loggedin)/(pollView)',
              params: {
                category: null,
                isUserPolls: false,
                isSavedPolls: false,
                isVotedPolls: false,
              }
            })}}>
              <Entypo name="gauge" size={(deviceWidth*400)/1000} color={colors.orange} />
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 40, color: colors.orange}}>Polls</Text>
                <MaterialIcons name="arrow-right-alt" size={40} color={colors.orange} />
              </View>
            </TouchableOpacity>
            <View style={{width: '95%', marginTop: 30, marginBottom: 10}}>
              <Text style={{fontSize: 30, color: colors.orange}}>Categories</Text>
            </View>
            
            <FlatList 
                data={categories}
                keyExtractor={(item) => item.value}
                style={{width: '90%'}}
                contentContainerStyle={styles.contentContainer}            
                renderItem={({item}) => (
                  <TouchableOpacity onPress={()=>{router.push({
                    pathname: '/(pollView)',
                    params: {
                      category: item.value,
                      isUserPolls: false,
                      isSavedPolls: false,
                      isVotedPolls: false,
                    }
                  })}}>
                    <View style={styles.categoryContainer} >
                        <ImageBackground style={styles.image} source={item.imagePath}>
                            <Text style={styles.labelText} >{item.label}</Text>
                        </ImageBackground>
                    </View>
                  </TouchableOpacity>

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
  pollButton: {
    backgroundColor: colors.orange05,
    borderRadius: 20,
    width: deviceWidth- 30,
    height: deviceHeight / 3,
    alignItems: 'center',
    justifyContent: 'center'
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