import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';

export default function ScreenWrapper({ children, style }) {
  return (
    <SafeAreaView 
      style={[{ flex: 1, backgroundColor: COLORS.background }, style]}
      edges={['top', 'bottom']} // Protects both top notch and bottom bar
    >
      {children}
    </SafeAreaView>
  );
}