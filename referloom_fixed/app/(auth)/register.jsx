// referloom_fixed/app/(auth)/register.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/theme/colors';

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useLocalSearchParams(); 
  const { setPendingUser, sendOtp } = useAuth(); // NEW!

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleData, setRoleData] = useState({});
  const [isSending, setIsSending] = useState(false);

  const handleRoleDataChange = (key, value) => {
    setRoleData(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Missing Fields", "Please fill in all basic info.");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      ...roleData
    };

    setIsSending(true);
    try {
      // 1. Save data in context memory temporarily
      setPendingUser(payload);
      
      // 2. Tell backend to send the OTP email
      await sendOtp(payload.email);
      
      // 3. Navigate to OTP Screen
      router.push({ pathname: '/(auth)/OTPVerificationScreen', params: { email: payload.email } });
    } catch (error) {
      Alert.alert("Error", error);
    } finally {
      setIsSending(false);
    }
  };

  const renderRoleSpecificFields = () => {
    // ... (This remains exactly the same as your previous code)
    switch (role) {
      case 'student':
        return (
          <>
            <InputField label="Course" placeholder="e.g. B.Tech CSE" value={roleData.course} onChangeText={(v) => handleRoleDataChange('course', v)} />
            <InputField label="Semester" placeholder="e.g. 5" keyboardType="numeric" value={roleData.semester} onChangeText={(v) => handleRoleDataChange('semester', v)} />
            <InputField label="University" placeholder="Navrachana University" value={roleData.university} onChangeText={(v) => handleRoleDataChange('university', v)} />
          </>
        );
      case 'alumni':
        return (
          <>
            <InputField label="Current Company" placeholder="e.g. Google" value={roleData.company} onChangeText={(v) => handleRoleDataChange('company', v)} />
            <InputField label="Job Role" placeholder="e.g. Software Engineer" value={roleData.jobRole} onChangeText={(v) => handleRoleDataChange('jobRole', v)} />
            <InputField label="Graduation Year" placeholder="e.g. 2022" keyboardType="numeric" value={roleData.graduationYear} onChangeText={(v) => handleRoleDataChange('graduationYear', v)} />
          </>
        );
      case 'company':
        return (
          <>
            <InputField label="Company Name" placeholder="e.g. Via Network" value={roleData.companyName} onChangeText={(v) => handleRoleDataChange('companyName', v)} />
            <InputField label="Industry Type" placeholder="e.g. Information Technology" value={roleData.industryType} onChangeText={(v) => handleRoleDataChange('industryType', v)} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Registration</Text>
            <Text style={styles.subtitle}>Let's get your profile set up.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <InputField label="First Name" placeholder="John" value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <InputField label="Last Name" placeholder="Doe" value={lastName} onChangeText={setLastName} />
              </View>
            </View>

            <InputField label="Email Address" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <InputField label="Password" placeholder="Create a strong password" secureTextEntry value={password} onChangeText={setPassword} />

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Role Specific Details</Text>
            
            {renderRoleSpecificFields()}

            <TouchableOpacity 
              style={[styles.primaryButton, isSending && { opacity: 0.7 }]} 
              activeOpacity={0.8} 
              onPress={handleRegister}
              disabled={isSending}
            >
              <Text style={styles.primaryButtonText}>{isSending ? "Sending Code..." : "Continue"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const InputField = ({ label, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={COLORS.text.secondary} selectionColor={COLORS.secondary} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  backButton: { marginBottom: 24, width: 40, height: 40, justifyContent: 'center', backgroundColor: COLORS.surface, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  header: { marginBottom: 32 },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.primary, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: COLORS.text.secondary },
  formContainer: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 16, fontSize: 16, color: COLORS.text.primary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 20 },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginTop: 16 },
  primaryButtonText: { color: COLORS.text.inverse, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});