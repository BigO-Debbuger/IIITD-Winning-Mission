import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  TextInput, TouchableOpacity,
  ScrollView, FlatList, ActivityIndicator
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { COLORS } from '../../../src/theme/colors';
import api from '../../../src/services/api';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';
import { useAuth } from '../../../src/context/AuthContext'; 

/* ---------- GENUINE INDUSTRY OPTIONS ---------- */
const FIELD_OPTIONS = [
  'Frontend Engineering', 'Backend Engineering', 'Full Stack (MERN)',
  'Mobile (React Native/iOS/Android)', 'Data Science & Analytics', 
  'Machine Learning & AI', 'DevOps & Cloud Infrastructure', 
  'UI/UX & Product Design', 'Product Management', 'Cybersecurity'
];
const COMPANY_OPTIONS = [
  'FAANG (Google, Amazon, etc.)', 'High-Growth Startups', 
  'Fintech (Stripe, Razorpay)', 'Service Based (TCS, Infosys)', 
  'Product Based (Atlassian, Swiggy, Zomato)'
];
const LOCATION_OPTIONS = [
  'Remote (Global)', 'Hybrid Work', 'Bangalore, KA', 'Pune, MH', 
  'Hyderabad, TS', 'Mumbai, MH', 'Delhi NCR', 'Chennai, TN'
];
const JOB_TYPE_OPTIONS = ['Full-Time Role', 'Summer Internship', '6-Month Internship', 'Contract / Freelance'];
const TIMELINE_OPTIONS = ['Immediately', 'Within 3 Months', 'Within 6 Months', 'Post Graduation (Next Year)'];

/* ---------- REUSABLE MULTI SELECT ---------- */
const MultiSelectDropdown = ({ label, options, selected, setSelected }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const toggleItem = (item) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.label}>{label}</Text>
      
      {/* TAGS */}
      <View style={styles.tagContainer}>
        {selected.map((item, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{item}</Text>
            <TouchableOpacity onPress={() => toggleItem(item)} style={{ marginLeft: 6 }}>
              <Feather name="x" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* INPUT DROPDOWN TOGGLE */}
      <TouchableOpacity style={styles.inputBox} onPress={() => setOpen(!open)}>
        <Text style={{ color: selected.length ? COLORS.text.primary : COLORS.text.secondary, fontSize: 15 }}>
          {selected.length ? "Add more..." : `Select ${label}...`}
        </Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={20} color={COLORS.text.secondary} />
      </TouchableOpacity>

      {/* DROPDOWN LIST */}
      {open && (
        <View style={styles.dropdown}>
          <TextInput placeholder="Search..." style={styles.search} value={search} onChangeText={setSearch} />
          
          {/* ✅ Changed FlatList to ScrollView to fix nested virtualization error */}
          <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
            {filtered.map((item) => {
              const checked = selected.includes(item);
              return (
                <TouchableOpacity key={item} style={styles.optionRow} onPress={() => toggleItem(item)}>
                  <Text style={[styles.optionText, checked && { color: COLORS.primary, fontWeight: '700' }]}>
                    {item}
                  </Text>
                  <View style={[styles.checkbox, checked && styles.checkedBox]}>
                    {checked && <Feather name="check" size={12} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
        </View>
      )}
    </View>
  );
};

/* ---------- MAIN SCREEN ---------- */
export default function CareerSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth(); 

  const existingRoadmap = user?.studentDetails?.aiCareerRoadmap;
  const existingPrefs = user?.studentDetails?.careerPreferences || {};
  const hasExistingRoadmap = existingRoadmap && existingRoadmap.length > 0;

  // ✅ UI STATE: Are we viewing the roadmap or editing the form?
  const [isEditing, setIsEditing] = useState(!hasExistingRoadmap);

  // ✅ PRE-FILL DATA if it exists
  const [fields, setFields] = useState(existingPrefs.fields || []);
  const [companies, setCompanies] = useState(existingPrefs.companies || []);
  const [locations, setLocations] = useState(existingPrefs.locations || []);
  const [jobTypes, setJobTypes] = useState(existingPrefs.jobTypes || []);
  const [timeline, setTimeline] = useState(existingPrefs.timeline || []);
  
  const [loading, setLoading] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState(existingRoadmap || null);

  const handleSubmit = async () => {
    if (fields.length === 0 || jobTypes.length === 0) {
      return Toast.show({
        type: 'error',
        text1: 'Required Fields Missing',
        text2: 'Please select at least one Target Field and Job Type.'
      });
    }

    setLoading(true);
    try {
      const response = await api.post('/users/career-preferences', {
        fields, companies, locations, jobTypes, timeline
      });
      
      const aiRoadmap = response.data.user.studentDetails.aiCareerRoadmap;
      setGeneratedRoadmap(aiRoadmap);
      
      await refreshUser(); 
      setIsEditing(false); // Switch back to View mode!
      
      Toast.show({
        type: 'success',
        text1: 'Roadmap Generated!',
        text2: 'Your AI career suggestions have been updated.'
      });
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not save preferences.'
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VIEW MODE: Show the AI Roadmap
  // ==========================================
  if (!isEditing && generatedRoadmap) {
    return (
      <ScreenWrapper>
        <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
              <Feather name="arrow-left" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Roadmap</Text>
            <View style={{ width: 34 }} />
          </View>
          
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.resultHeaderBox}>
              <View style={styles.magicIcon}>
                <MaterialCommunityIcons name="magic-staff" size={40} color="#FFF" />
              </View>
              <Text style={styles.resultTitle}>Analysis Complete!</Text>
              <Text style={styles.resultSub}>We compared your current profile against your target goals. Here is your personalized action plan:</Text>
            </View>

            <View style={styles.roadmapBox}>
              {generatedRoadmap.map((step, index) => (
                <View key={index} style={styles.roadmapStep}>
                  <View style={styles.stepNumberBox}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton title="Explore Jobs" onPress={() => router.push('/(roles)/student/JobMatchScreen')} />
            
            {/* ✅ EDIT BUTTON: Simply toggles state to show form again */}
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
              <Feather name="edit-2" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.editBtnText}>Edit Preferences & Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  // ==========================================
  // EDIT/FORM MODE: Show the Inputs
  // ==========================================
  return (
    <ScreenWrapper>
      <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
        
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => hasExistingRoadmap ? setIsEditing(false) : router.back()} 
            style={{ padding: 5 }}
          >
            <Feather name="x" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Career Goals</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Where are you headed? 🎯</Text>
            <Text style={styles.sub}>
              Tell us what you want. Our AI will analyze your profile and give you a personalized path to get there.
            </Text>
          </View>

          <MultiSelectDropdown label="Target Fields / Roles *" options={FIELD_OPTIONS} selected={fields} setSelected={setFields} />
          <MultiSelectDropdown label="Target Job Type *" options={JOB_TYPE_OPTIONS} selected={jobTypes} setSelected={setJobTypes} />
          <MultiSelectDropdown label="Preferred Locations" options={LOCATION_OPTIONS} selected={locations} setSelected={setLocations} />
          <MultiSelectDropdown label="Timeline & Urgency" options={TIMELINE_OPTIONS} selected={timeline} setSelected={setTimeline} />
          <MultiSelectDropdown label="Company Types (Optional)" options={COMPANY_OPTIONS} selected={companies} setSelected={setCompanies} />
          
          <View style={{ height: 60 }} />
        </ScrollView>
        
        <View style={styles.footer}>
          <PrimaryButton 
            title={hasExistingRoadmap ? "Update & Re-Analyze" : "Generate AI Roadmap"} 
            onPress={handleSubmit} 
            isLoading={loading} 
          />
        </View>

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  container: { flex: 1, padding: 20 },
  headerContent: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 22 },
  label: { fontSize: 15, fontWeight: '700', marginBottom: 10, color: COLORS.text.primary },
  inputBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 16, backgroundColor: COLORS.surface },
  dropdown: { marginTop: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  search: { padding: 14, borderBottomWidth: 1, borderColor: COLORS.border, fontSize: 15, backgroundColor: '#F9FAFB' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: COLORS.border },
  optionText: { color: COLORS.text.primary, fontSize: 15 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checkedBox: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  tagText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  footer: { padding: 20, backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border },
  
  // ROADMAP STYLES
  resultHeaderBox: { alignItems: 'center', paddingVertical: 20, marginBottom: 10 },
  magicIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  resultSub: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  roadmapBox: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  roadmapStep: { flexDirection: 'row', marginBottom: 20 },
  stepNumberBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: `${COLORS.primary}20`, justifyContent: 'center', alignItems: 'center', marginRight: 16, marginTop: 2 },
  stepNumber: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
  stepText: { flex: 1, fontSize: 15, color: COLORS.text.primary, lineHeight: 24, fontWeight: '500' },
  
  // EDIT BUTTON STYLES
  editBtn: { marginTop: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderRadius: 12, backgroundColor: `${COLORS.primary}10` },
  editBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' }
});