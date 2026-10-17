import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../theme/colors';

export default function FitScoreBadge({ score, size = 60 }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Change color based on score
  const getColor = () => {
    if (score >= 80) return COLORS.success; // Green
    if (score >= 50) return '#FFA500';      // Orange
    return COLORS.error;                    // Red
  };

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle stroke="#E0E0E0" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" />
        {/* Progress Circle */}
        <Circle 
          stroke={getColor()} 
          cx={size / 2} cy={size / 2} r={radius} 
          strokeWidth={strokeWidth} 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          transform={`rotate(-90 ${size/2} ${size/2})`} 
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.textContainer]}>
        <Text style={[styles.scoreText, { color: getColor() }]}>{score}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
  scoreText: { fontSize: 14, fontWeight: 'bold' }
});