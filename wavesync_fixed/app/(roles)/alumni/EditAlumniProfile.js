import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; // 👈 Added Image Picker

import { COLORS } from '../../../src/theme/colors';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';
import CustomInput from '../../../src/components/ui/CustomInput';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api'; 

export default function EditAlumniProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuth(); // Make sure to pull setUser
  
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    graduationYear: user?.alumniDetails?.graduationYear?.toString() || '',
    companyName: user?.alumniDetails?.company || '', 
    designation: user?.alumniDetails?.role || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.3, base64: true, 
    });

    if (!result.canceled) {
      setIsUploading(true);
      try {
        const response = await api.put('/users/profile', { base64Image: result.assets[0].base64 });
        setProfileImage(response.data.user.profileImage);
        setUser(response.data.user);
        Alert.alert("Success", "Profile picture updated!");
      } catch (error) {
        Alert.alert("Upload Failed", "Could not save image.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/users/profile', {
        fullName: form.fullName,
        alumniDetails: {
          graduationYear: form.graduationYear,
          company: form.companyName,
          role: form.designation
        },
        isProfileComplete: true 
      });
      setUser(response.data.user);
      Alert.alert("Success", "Career Journey Updated!");
      router.back();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Career Journey</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* ✅ AVATAR UPLOAD UI */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={isUploading}>
              {isUploading ? (
                <ActivityIndicator color="#FFF" />
              ) : profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'A'}</Text>
              )}
              <View style={styles.editImageBadge}><Feather name="camera" size={14} color="#FFF" /></View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to update photo</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            <CustomInput label="Full Name" value={form.fullName} onChangeText={(t) => setForm({...form, fullName: t})} />
            <CustomInput label="Graduation Year" placeholder="e.g. 2021" keyboardType="numeric" value={form.graduationYear} onChangeText={(t) => setForm({...form, graduationYear: t})} />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Current Employment</Text>
            <CustomInput label="Company Name" placeholder="e.g. Google, Microsoft" value={form.companyName} onChangeText={(t) => setForm({...form, companyName: t})} />
            <CustomInput label="Designation / Role" placeholder="e.g. Product Manager" value={form.designation} onChangeText={(t) => setForm({...form, designation: t})} />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton title="Save Profile" onPress={handleSave} isLoading={isSaving} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  // Avatar Styles
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 45 },
  avatarText: { fontSize: 36, color: COLORS.surface, fontWeight: 'bold' },
  editImageBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.secondary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  avatarHint: { color: COLORS.text.secondary, fontSize: 12, marginTop: 8 },

  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 16 },
  footer: { padding: 20, backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border }
});