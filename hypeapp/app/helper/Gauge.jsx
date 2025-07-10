import { StyleSheet, View, Text } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import colors from "./colors";

const Gauge = ({ preview=true, leftLabel, rightLabel, leftVotes, rightVotes, gaugeWidth, gaugeHeight, gaugeRadius, pointerLength}) => {
  const width = gaugeWidth;
  const height = gaugeHeight;
  const centerX = width / 2; 
  const centerY = height;
  const radius = gaugeRadius;

  const angle = leftVotes + rightVotes === 0 ? 0 : (90 * (rightVotes - leftVotes)) / (leftVotes + rightVotes);
  const angleRad = (angle * Math.PI) / 180;

  const pointerX = centerX + (pointerLength+radius) * Math.sin(angleRad);
  const pointerY = centerY - (pointerLength+radius) * Math.cos(angleRad);
  
  return (
    <View style={styles.gaugeContainer}>
      <View>
        <Svg width={width} height={height} >
          <Path
            d={`
              M ${centerX - radius} ${centerY}
              A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}
            `}
            fill="rgba(0,0,0,0.04)"
            stroke={colors.red1}
            strokeWidth={10}
          />

          <SvgText
            x={centerX-radius * 0.4}
            y={centerY-radius*0.35}
            fontSize={preview==true ? 12: 20}
            textAnchor="middle"
          >
            {leftLabel}
          </SvgText>

          <SvgText
            x={centerX+radius * 0.4}
            y={centerY-radius*0.35}
            fontSize={preview==true ? 12: 20}
            textAnchor="middle"
          >
            {rightLabel}
          </SvgText>

          <Line
            x1={centerX}
            y1={centerY}
            x2={pointerX}
            y2={pointerY}
            stroke={colors.red2}
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
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'white'
    //borderWidth: 5,
    //borderRadius: 1,
    //borderEndEndRadius: 20,
    //borderTopEndRadius: 20,
    //borderColor: 'gray',
  }
})