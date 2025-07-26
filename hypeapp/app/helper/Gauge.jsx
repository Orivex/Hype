import { StyleSheet, View, Text, useAnimatedValue } from "react-native";
import Svg, { Circle, Line, Text as SvgText, Image as SvgImage, Path } from 'react-native-svg';
import colors from "./colors";
import { useEffect, useRef } from "react";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";

//Very IMPORTANT. Otherwise it recreates on every re-render
const AnimatedLine = Animated.createAnimatedComponent(Line);

const Gauge = ({ preview=true, leftLabel, rightLabel, leftVotes, rightVotes, gaugeWidth, gaugeHeight, gaugeRadius}) => {
  const width = gaugeWidth;
  const height = gaugeHeight;
  const centerX = width / 2; 
  const centerY = height;
  const radius = gaugeRadius;
  const pointerLength = radius/3;
  const circleRadius = radius/15;
  const circleOffset = circleRadius*2;
  const pointerWidth = circleRadius*2;

  const sharedCenterX = useSharedValue(centerX);
  const sharedCenterY = useSharedValue(centerY);
  const sharedRadius = useSharedValue(radius);
  const sharedPointerLength = useSharedValue(pointerLength);

  const angle = useSharedValue(0);

  useEffect(() => {
    const totalVotes = leftVotes + rightVotes ?? 0;
    const newAngle = totalVotes === 0 ? 0 : (90 * (rightVotes - leftVotes)) / totalVotes;
    angle.value = withTiming(newAngle, {duration: 250});
  }, [leftVotes, rightVotes])

  const animatedPointerProps = useAnimatedProps(()=> {
    const angleRad = (angle.value * Math.PI) / 180;
    const pointerX = sharedCenterX.value + (sharedPointerLength.value + sharedRadius.value) * Math.sin(angleRad);
    const pointerY = sharedCenterY.value - (sharedPointerLength.value + sharedRadius.value) * Math.cos(angleRad);
    return {
      x2: pointerX,
      y2: pointerY-7
    }
  })
  
  return (
    <View style={styles.gaugeContainer}>
      <Svg 
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        //style={{backgroundColor: 'white'}}
        >

        <SvgImage
        href={require('@/assets/images/gauge.png')}
        x={centerX-(width/2)}
        y={centerY-height}
        width={width}
        height={height}
        />
        <Path
          d={`
            M ${centerX - radius} ${centerY}
            A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}
          `}
          fill="rgba(0,0,0,0.00)"
          stroke='rgba(0,0,0,0.03)'
          strokeWidth={10}
        />
        <AnimatedLine
          animatedProps={animatedPointerProps}
          x1={centerX}
          y1={centerY-circleOffset}
          stroke={'gray'}
          strokeWidth={pointerWidth}
          strokeLinecap='round'
        />
        
        <Circle cx={centerX} cy={centerY-circleOffset} r={circleRadius} fill='lightgray' />

        <SvgText
          x={centerX-radius*1.075}
          y={centerY-radius*0.1}
          fontSize={width/20}
          textAnchor="end"
          fill={'white'}
          stroke={'black'}
          strokeWidth={preview ? 0.2: 0.5}
        >
        {leftLabel}
        </SvgText>
        <SvgText
          x={centerX+radius*1.075}
          y={centerY-radius*0.1}
          fontSize={width/20}
          fill={'black'}
          stroke={'white'}
          strokeWidth={preview ? 0.2: 0.4}
        >
          {rightLabel}
        </SvgText>
      </Svg>
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