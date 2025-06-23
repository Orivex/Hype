import { StyleSheet, View, Text } from "react-native";
import Svg, { Circle, Line, Path } from 'react-native-svg';
import AntDesign from '@expo/vector-icons/AntDesign';

const Gauge = ({ no=0, yes=0 }) => {
  const width = 110;
  const height = 80;
  const centerX = width / 2; 
  const centerY = height;
  const radius = 50;

  const angle = no + yes === 0 ? 0 : (90 * (yes - no)) / (no + yes);
  const angleRad = (angle * Math.PI) / 180;

  const pointerX = centerX + (20+radius) * Math.sin(angleRad);
  const pointerY = centerY - (20+radius) * Math.cos(angleRad);
  
  return (
    <View style={styles.gaugeContainer}>

      <View style={styles.timeLeft}>
        <AntDesign name="clockcircleo" size={20} color="black" />
        <Text>01:47 left</Text>
      </View>

      <View>
        <Svg width={width} height={height} >
          <Path
            d={`
              M ${centerX - radius} ${centerY}
              A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}
            `}
            fill="none"
            stroke="#ccc"
            strokeWidth={10}
          />

          <Line
            x1={centerX}
            y1={centerY}
            x2={pointerX}
            y2={pointerY}
            stroke="red"
            strokeWidth={4}
          />

          <Circle cx={centerX} cy={centerY} r={5} fill="#ccc" />
        </Svg>
      </View>
    </View>
  );
};

export default Gauge;

const styles = StyleSheet.create({
  gaugeContainer: {
    width: 130,
    height: 125,
    justifyContent: 'center',
    alignItems: 'center',
    //borderWidth: 5,
    //borderRadius: 1,
    //borderEndEndRadius: 20,
    //borderTopEndRadius: 20,
    //borderColor: 'gray',
  },
timeLeft: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems:'center'
  }
})