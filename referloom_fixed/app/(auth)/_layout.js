import { Stack } from 'expo-router';
import { COLORS } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.background }
    }}>
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="RoleSelectScreen" />
      <Stack.Screen name="SignupStudentScreen" />
      {/* ADDED MISSING SCREENS BELOW */}
      <Stack.Screen name="SignupAlumniScreen" />
      <Stack.Screen name="SignupCompanyScreen" />
      <Stack.Screen name="OTPVerificationScreen" />
    </Stack>
  );
}