import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const Gauge = ({ no, yes }) => {
  const width = 300;
  const height = 150;
  const centerX = width / 2; 
  const centerY = height;
  const radius = 120;

  // Berechne Winkel
  const angle = no + yes === 0 ? 0 : (90 * (yes - no)) / (no + yes);
  const angleRad = (angle * Math.PI) / 180;

  // Zeigerspitze berechnen
  const pointerX = centerX + (30+radius) * Math.sin(angleRad);
  const pointerY = centerY - (30+radius) * Math.cos(angleRad);
  
  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Halbkreis */}
        <Path
          d={`
            M ${centerX - radius} ${centerY}
            A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}
          `}
          fill="none"
          stroke="#ccc"
          strokeWidth={10}
        />

        {/* Zeiger */}
        <Line
          x1={centerX}
          y1={centerY}
          x2={pointerX}
          y2={pointerY}
          stroke="red"
          strokeWidth={4}
        />

        {/* Zentrumspunkt */}
        <Circle cx={centerX} cy={centerY} r={5} fill="#ccc" />
      </Svg>

      <Text style={styles.label}>
        x = {no}, y = {yes}, angle = {angle.toFixed(1)}°
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    color: 'white'
  },
});

export default function App() {

  const [no, setNo] = useState(0);
  const [yes, setYes] = useState(0);

  return (

    <View style={{flex:1, justifyContent: 'center'}}>
      <Gauge no={no} yes={yes} />

      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        <Button title='No' onPress={()=>{setNo(prev=>prev+1)}}/>
        <Button title='Yes' onPress={()=>{setYes(prev=>prev+1)}}/>
      </View>
    </View>

  )
}
