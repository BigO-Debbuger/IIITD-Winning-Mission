import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Platform, KeyboardAvoidingView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api';
import { COLORS } from '../../../src/theme/colors';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';
import CustomInput from '../../../src/components/ui/CustomInput';

export default function CompanyProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser, logout, isLoading: authLoading } = useAuth(); 
  
  // 1. STATE HOOKS
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    companyName: '',
    industryType: '', 
    website: '',
    description: ''
  });

  // 2. LOGOUT SAFETY CHECK
  if (!user) return null;

  // 3. DERIVED VARIABLES (Calculated once!)
  const isComplete = profile ? profile.isProfileComplete : user?.isProfileComplete;
  const companyName = profile?.companyDetails?.companyName || profile?.fullName || 'Your Company';
  const initial = companyName.charAt(0).toUpperCase();

  // 4. FETCH DATA FUNCTION
  const fetchCompanyProfile = async () => {
    try {
      const targetId = user?.id || user?._id; 
      const response = await api.get(`/users/${targetId}`);
      setProfile(response.data);
      
      setForm({
        companyName: response.data?.companyDetails?.companyName || response.data?.fullName || '',
        industryType: response.data?.companyDetails?.industryType || '',
        website: response.data?.companyDetails?.website || '',
        description: response.data?.companyDetails?.description || response.data?.bio || ''
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 5. EFFECT HOOKS
  useEffect(() => {
    if (!authLoading) {
      if (user?.id || user?._id) fetchCompanyProfile();
      else setLoading(false);
    }
  }, [user, authLoading]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompanyProfile();
  }, [user]);

  // 6. FORM HANDLER
  const handleSaveProfile = async () => {
    if (!form.companyName || !form.industryType) {
      Alert.alert("Missing Details", "Company Name and Industry are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData = {
        fullName: form.companyName, 
        bio: form.description,
        companyDetails: {
          companyName: form.companyName,
          industryType: form.industryType, 
          website: form.website,
          description: form.description
        },
        isProfileComplete: true 
      };
      
      const response = await api.put('/users/profile', updatedData);
      
      setUser(response.data.user); 
      
      Alert.alert("Success", "Company profile updated successfully!");
      setEditModalVisible(false);
      fetchCompanyProfile(); 
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. RENDER
  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      <View style={styles.topNav}>
        <Text style={styles.navTitle}>Company Profile</Text>
        {isComplete && (
          <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editBtn}>
            <Feather name="edit-3" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{companyName}</Text>
          <Text style={styles.industry}>
            {profile?.companyDetails?.industryType || 'Industry not specified'}
          </Text>
          
          {profile?.companyDetails?.website ? (
            <View style={styles.websiteBadge}>
              <Feather name="link" size={12} color={COLORS.secondary} />
              <Text style={styles.websiteText}>{profile.companyDetails.website}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoRow}>
            <Feather name="mail" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>{profile?.email || 'email@company.com'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="shield" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>Verified Company Account</Text>
          </View>
        </View>

        {!isComplete ? (
          <View style={styles.actionRequiredCard}>
            <View style={styles.actionIconBox}>
              <Feather name="alert-circle" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>Profile Incomplete</Text>
            <Text style={styles.actionSub}>
              You need to complete the rest of your company details (like your website and About Us section) to unlock the dashboard.
            </Text>
            <PrimaryButton 
              title="Complete Profile Setup" 
              onPress={() => setEditModalVisible(true)} 
            />
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About Us</Text>
            <Text style={styles.bodyText}>
              {profile?.companyDetails?.description || profile?.bio || "Tell candidates about your company culture, mission, and why they should join your team."}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Feather name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isComplete ? "Edit Company Info" : "Complete Profile Setup"}
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <CustomInput 
                label="Company Name" 
                placeholder="e.g. Google, Stripe" 
                value={form.companyName}
                onChangeText={t => setForm({...form, companyName: t})} 
              />
              <CustomInput 
                label="Industry" 
                placeholder="e.g. Fintech, E-Commerce" 
                value={form.industryType}
                onChangeText={t => setForm({...form, industryType: t})} 
              />
              <CustomInput 
                label="Website URL" 
                placeholder="e.g. www.yourcompany.com" 
                value={form.website}
                onChangeText={t => setForm({...form, website: t})} 
                autoCapitalize="none"
              />
              
              <Text style={styles.label}>About Us</Text>
              <TextInput 
                style={styles.textArea} 
                multiline 
                placeholder="Describe your company..." 
                value={form.description}
                onChangeText={t => setForm({...form, description: t})} 
              />
            </ScrollView>

            <PrimaryButton 
              title={isComplete ? "Save Changes" : "Complete Setup & Unlock"} 
              onPress={handleSaveProfile} 
              isLoading={isSubmitting} 
            />

          </KeyboardAvoidingView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  navTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  editBtn: { padding: 8, backgroundColor: `${COLORS.primary}10`, borderRadius: 8 },
  
  headerCard: { backgroundColor: COLORS.surface, padding: 30, alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderColor: COLORS.border },
  logoContainer: { width: 90, height: 90, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  logoText: { fontSize: 36, color: COLORS.surface, fontWeight: 'bold' },
  name: { fontSize: 26, fontWeight: '800', color: COLORS.text.primary, marginBottom: 4, textAlign: 'center' },
  industry: { fontSize: 15, color: COLORS.text.secondary, fontWeight: '500', marginBottom: 16 },
  websiteBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.secondary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  websiteText: { fontSize: 13, fontWeight: '700', color: COLORS.secondary, marginLeft: 6 },

  actionRequiredCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  actionIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${COLORS.primary}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  actionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 8, textAlign: 'center' },
  actionSub: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },

  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 12 },
  bodyText: { fontSize: 15, color: COLORS.text.secondary, lineHeight: 24 },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 15, color: COLORS.text.primary, marginLeft: 12, fontWeight: '500' },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, marginHorizontal: 20, marginTop: 10, marginBottom: 40, backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: '700', marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary, marginBottom: 8, marginTop: 8 },
  textArea: { backgroundColor: COLORS.background, borderRadius: 12, padding: 16, fontSize: 15, color: COLORS.text.primary, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border, height: 120, textAlignVertical: 'top' }
});