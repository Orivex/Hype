import { Dimensions } from 'react-native'

const deviceSizes = {
    deviceWidth: Dimensions.get('window').width,
    deviceHeight: Dimensions.get('window').height,
    deviceScale: Dimensions.get('window').scale,
    deviceFontScale: Dimensions.get('window').fontScale,
}

export default deviceSizes;