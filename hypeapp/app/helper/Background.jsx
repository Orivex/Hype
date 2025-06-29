import { ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Background({children}) {

    return(
        <ImageBackground source={require("@/assets/images/bg.png")} resizeMode='cover' style={{flex: 1}}>
            <SafeAreaView style={{flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center'}}>
                {children}
            </SafeAreaView>
        </ImageBackground>
    )


}