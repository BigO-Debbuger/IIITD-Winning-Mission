import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message'; // ✅ Beautiful Alerts

import { useAuth } from '../../../src/context/AuthContext';
import { COLORS } from '../../../src/theme/colors';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';
import CustomInput from '../../../src/components/ui/CustomInput';
import api from '../../../src/services/api';

export default function EditProfile() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || null,
    visibilityMode: user?.visibilityMode === 'public'
  });

  // ✅ Safe Back Navigation
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback if stack is broken
      router.replace('/(roles)/student'); 
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    formData.append('upload_preset', 'referloom_preset');

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ ...form, profileImage: response.data.url });
      
      Toast.show({
        type: 'success',
        text1: 'Photo Uploaded',
        text2: 'Looking good! Don\'t forget to save changes.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Could not upload image. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData = {
        fullName: form.fullName,
        headline: form.headline,
        bio: form.bio,
        profileImage: form.profileImage,
        visibilityMode: form.visibilityMode ? 'public' : 'private',
        isProfileComplete: true 
      };

      const response = await api.put('/users/profile', updatedData);
      setUser(response.data.user);
      
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your changes have been saved successfully.',
      });

      // Give toast time to show before navigating back
      setTimeout(() => {
        handleGoBack();
      }, 1000);

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.closeBtn}>
            <Feather name="x" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Personal Info</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {form.profileImage ? (
                <Image source={{ uri: form.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="camera" size={30} color={COLORS.text.secondary} />
                </View>
              )}
              {uploading && (
                <View style={styles.imageOverlay}>
                  <ActivityIndicator color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.imageText}>Change Profile Photo</Text>
          </View>

          <View style={styles.formGroup}>
            <CustomInput
              label="Full Name"
              value={form.fullName}
              onChangeText={(t) => setForm({ ...form, fullName: t })}
              placeholder="Your name from registration"
            />

            <CustomInput
              label="Professional Headline"
              value={form.headline}
              onChangeText={(t) => setForm({ ...form, headline: t })}
              placeholder="e.g. Computer Science Student | AI Enthusiast"
            />

            <Text style={styles.label}>About Me (Bio)</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={5}
              placeholder="Tell alumni and recruiters about yourself..."
              placeholderTextColor={COLORS.text.secondary}
              value={form.bio}
              onChangeText={(t) => setForm({ ...form, bio: t })}
            />
          </View>

          <View style={styles.privacyCard}>
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>Public Profile</Text>
              <Text style={styles.privacySub}>
                Allow companies and alumni to find your profile.
              </Text>
            </View>
            <Switch
              value={form.visibilityMode}
              onValueChange={(val) => setForm({ ...form, visibilityMode: val })}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.surface}
            />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton 
            title="Save Changes" 
            onPress={handleSave} 
            isLoading={loading} 
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  closeBtn: { padding: 8 },
  scrollContent: { padding: 24 },
  imageSection: { alignItems: 'center', marginBottom: 32 },
  imageContainer: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  imageText: { marginTop: 12, fontSize: 14, fontWeight: '700', color: COLORS.secondary },
  formGroup: { gap: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary, marginBottom: 8 },
  textArea: { 
    backgroundColor: COLORS.surface, 
    borderRadius: 12, 
    padding: 16, 
    height: 120, 
    textAlignVertical: 'top', 
    color: COLORS.text.primary, 
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  privacyCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.surface, 
    padding: 20, 
    borderRadius: 16, 
    marginTop: 32,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  privacyText: { flex: 1, paddingRight: 16 },
  privacyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  privacySub: { fontSize: 13, color: COLORS.text.secondary, marginTop: 2 },
  footer: { padding: 24, backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border }
});