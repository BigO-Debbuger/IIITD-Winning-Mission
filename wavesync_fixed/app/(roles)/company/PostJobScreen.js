import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  KeyboardAvoidingView, Platform, TextInput, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { COLORS } from '../../../src/theme/colors';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';
import CustomInput from '../../../src/components/ui/CustomInput';
import api from '../../../src/services/api'; 
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';

export default function PostJobScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'Full-time', 
    location: '',
    description: '',
  });
  
  // Tech Stack state for matching engine
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    const newSkill = skillInput.trim();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setSkillInput('');
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const handlePostJob = async () => {
    // ✅ FIX: Check the 'skills' array instead of 'form.requirements'
    if (!form.title || skills.length === 0 || !form.description) {
      return Alert.alert("Missing Fields", "Title, Tech Stack, and Description are mandatory.");
    }

    setLoading(true);
    try {
      // ✅ FIX: Send the 'skills' array as 'requirements' directly to the backend
      const payload = {
        ...form,
        requirements: skills,
        jobType: form.type // Ensure naming matches your backend model
      };

      await api.post('/jobs', payload);
      
      Alert.alert("Success", "Job posted to the student network! 🎉");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Job Listing</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* BASIC DETAILS */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Basic Details</Text>
              
              <CustomInput 
                label="Job Title" 
                placeholder="e.g. Senior Frontend Engineer" 
                value={form.title}
                onChangeText={(t) => setForm({...form, title: t})}
              />

              <CustomInput 
                label="Location" 
                placeholder="e.g. Remote, Mumbai, etc." 
                value={form.location}
                onChangeText={(t) => setForm({...form, location: t})}
              />

              <Text style={styles.label}>Job Type</Text>
              <View style={styles.typeContainer}>
                {['Full-time', 'Internship', 'Contract'].map((type) => (
                  <TouchableOpacity 
                    key={type}
                    style={[styles.typeBadge, form.type === type && styles.typeBadgeActive]}
                    onPress={() => setForm({...form, type})}
                  >
                    <Text style={[styles.typeText, form.type === type && styles.typeTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* TECH STACK (AI MATCHING DATA) */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Required Tech Stack</Text>
              <Text style={styles.helperText}>Add skills to help our AI find the best candidates.</Text>
              
              <View style={styles.skillInputRow}>
                <View style={{ flex: 1 }}>
                  <CustomInput 
                    placeholder="e.g. Node.js, React Native..." 
                    value={skillInput}
                    onChangeText={setSkillInput}
                    onSubmitEditing={handleAddSkill} 
                  />
                </View>
                <TouchableOpacity style={styles.addSkillBtn} onPress={handleAddSkill}>
                  <Feather name="plus" size={20} color={COLORS.surface} />
                </TouchableOpacity>
              </View>

              <View style={styles.skillsGrid}>
                {skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{skill}</Text>
                    <TouchableOpacity onPress={() => removeSkill(index)} style={styles.removeSkillBtn}>
                      <Feather name="x" size={14} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* DESCRIPTION */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Job Description</Text>
              <TextInput 
                style={styles.textArea} 
                multiline 
                placeholder="Describe the responsibilities and requirements..."
                placeholderTextColor={COLORS.text.secondary}
                value={form.description}
                onChangeText={(t) => setForm({...form, description: t})}
              />
            </View>
            
          </ScrollView>

          {/* PUBLISH BUTTON */}
          <View style={styles.footer}>
            <PrimaryButton 
              title="Publish Job Listing" 
              onPress={handlePostJob} 
              isLoading={loading}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: COLORS.surface, 
    borderBottomWidth: 1, 
    borderColor: COLORS.border 
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  scrollContent: { padding: 20, paddingBottom: 20 },
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 16 },
  helperText: { fontSize: 13, color: COLORS.text.secondary, marginTop: -10, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary, marginBottom: 8, marginTop: 8 },
  typeContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  typeBadge: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 100, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  typeBadgeActive: { backgroundColor: `${COLORS.primary}15`, borderColor: COLORS.primary },
  typeText: { fontSize: 14, fontWeight: '600', color: COLORS.text.secondary },
  typeTextActive: { color: COLORS.primary, fontWeight: '700' },
  skillInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addSkillBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  skillChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  skillChipText: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary, marginRight: 8 },
  removeSkillBtn: { padding: 2 },
  textArea: { backgroundColor: COLORS.background, borderRadius: 12, padding: 16, height: 150, textAlignVertical: 'top', color: COLORS.text.primary, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  footer: { padding: 20, backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border }
});