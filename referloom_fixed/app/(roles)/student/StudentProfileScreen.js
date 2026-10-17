import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Platform,
  KeyboardAvoidingView, Image, Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; 
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api';
import { COLORS } from '../../../src/theme/colors';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';

export default function StudentProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, isLoading: authLoading } = useAuth(); 
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState([]);
  
  // UI States
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false); 

  // Form States
  const [editingExpIndex, setEditingExpIndex] = useState(null); // Track which experience is being edited
  const [expForm, setExpForm] = useState({ 
    role: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' 
  });
  const [skillInput, setSkillInput] = useState('');
  const [projectForm, setProjectForm] = useState({ title: '', description: '', tags: '', githubUrl: '' });

  if (!user) return null;
  const isComplete = profile ? profile.isProfileComplete : user?.isProfileComplete;

  /* ================== READ (FETCH DATA) ================== */
  const fetchFullProfile = async () => {
    try {
      const targetId = user?.id || user?._id; 
      const response = await api.get(`/users/${targetId}`);
      setProfile(response.data);

      if (user?.isProfileComplete) {
        const appRes = await api.get('/jobs/my-applications');
        setApplications(appRes.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user?.id || user?._id) fetchFullProfile();
      else setLoading(false);
    }
  }, [user, authLoading]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFullProfile();
  }, [user]);

  /* ================== CREATE / UPDATE ================== */
  const handleAddData = async (type) => {
    setIsSubmitting(true);
    try {
      if (type === 'experience') {
        let updatedExp = [...(profile?.studentDetails?.experience || [])];
        
        // Check if editing or adding new
        if (editingExpIndex !== null) {
          updatedExp[editingExpIndex] = expForm;
        } else {
          updatedExp.push(expForm);
        }
        await api.put('/users/profile', { experience: updatedExp });
        
      } else if (type === 'skill') {
        const updatedSkills = [...(profile?.studentDetails?.skills || []), skillInput];
        await api.put('/users/profile', { skills: updatedSkills });
      } else if (type === 'project') {
        const projectPayload = {
          ...projectForm,
          tags: projectForm.tags.split(',').map(t => t.trim())
        };
        await api.post('/projects', projectPayload);
      }
      
      // Reset forms & states
      setActiveModal(null);
      setEditingExpIndex(null);
      setExpForm({ role: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' });
      setSkillInput('');
      setProjectForm({ title: '', description: '', tags: '', githubUrl: '' });
      fetchFullProfile();
    } catch (error) {
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================== DELETE ================== */
  const handleDelete = async (type, indexOrId) => {
    Alert.alert("Delete", `Are you sure you want to remove this ${type}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            if (type === 'skill') {
              const updatedSkills = profile.studentDetails.skills.filter((_, i) => i !== indexOrId);
              await api.put('/users/profile', { skills: updatedSkills });
            } else if (type === 'experience') {
              const updatedExp = profile.studentDetails.experience.filter((_, i) => i !== indexOrId);
              await api.put('/users/profile', { experience: updatedExp });
            } else if (type === 'project') {
              await api.delete(`/collab/${indexOrId}`); 
            }
            fetchFullProfile();
          } catch (error) {
            Alert.alert("Error", "Failed to delete item.");
          }
        } 
      }
    ]);
  };

  /* ================== UPLOAD PROFILE IMAGE ================== */
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3, 
      base64: true, 
    });

    if (!result.canceled) {
      setImageUploading(true);
      try {
        await api.put('/users/profile', { base64Image: result.assets[0].base64 });
        fetchFullProfile();
        Alert.alert("Success", "Profile picture updated!");
      } catch (error) {
        Alert.alert("Upload Failed", "Could not save image to server.");
      } finally {
        setImageUploading(false);
      }
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* TOP NAVIGATION */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} color={COLORS.text.primary} /></TouchableOpacity>
        <Text style={styles.navTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}><Feather name="more-vertical" size={24} color={COLORS.primary} /></TouchableOpacity>
      </View>

      {/* 3-DOT MENU MODAL */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.menuOverlayMenu} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuDropdown, { top: insets.top + 60 }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push('/(roles)/student/EditProfile'); }}>
              <Feather name="edit-3" size={18} color={COLORS.primary} />
              <Text style={styles.menuText}>Edit Profile</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); logout(); }}>
              <Feather name="log-out" size={18} color={COLORS.error} />
              <Text style={[styles.menuText, { color: COLORS.error }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} showsVerticalScrollIndicator={false}>
        
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={imageUploading}>
            {imageUploading ? (
              <ActivityIndicator color="#FFF" />
            ) : profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
            ) : (
              <Text style={styles.avatarText}>{profile?.fullName?.charAt(0) || 'S'}</Text>
            )}
            <View style={styles.editImageBadge}>
              <Feather name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.name}>{profile?.fullName}</Text>
          <Text style={styles.university}>{profile?.studentDetails?.course || 'Student'}</Text>
        </View>

        {/* 🧠 NEW AI PROFILE STRENGTH CARD (Shows only if profile is complete) */}
        {isComplete && profile?.profileStrength !== undefined && (
          <View style={styles.strengthCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionLabel}>AI Profile Strength</Text>
              <Text style={styles.strengthScore}>{profile.profileStrength}%</Text>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${profile.profileStrength}%`, 
                    backgroundColor: profile.profileStrength >= 80 ? '#10B981' : profile.profileStrength >= 50 ? '#F59E0B' : '#EF4444' 
                  }
                ]} 
              />
            </View>

            {/* AI Suggestions Box */}
            <View style={styles.suggestionsBox}>
              {profile.profileSuggestions?.map((sug, i) => (
                <View key={i} style={styles.suggestionRow}>
                  <Feather name="zap" size={16} color={COLORS.secondary} style={{ marginTop: 2 }} />
                  <Text style={styles.suggestionText}>{sug}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* PROFILE SETUP / CONTENT RENDERING */}
        {!isComplete ? (
          <View style={styles.actionRequiredCard}>
            <View style={styles.actionIconBox}>
              <Feather name="user-plus" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>Profile Setup Required</Text>
            <Text style={styles.actionSub}>Add your experience, projects, and skills to unlock AI job matches.</Text>
            <PrimaryButton title="    Complete Profile    " onPress={() => router.push('/(roles)/student/EditProfile')} />
          </View>
        ) : (
          <>
            {/* EXPERIENCE CRUD */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Experience</Text>
                <TouchableOpacity onPress={() => {
                  setEditingExpIndex(null);
                  setExpForm({ role: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' });
                  setActiveModal('experience');
                }}>
                  <Feather name="plus-circle" size={22} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
              {profile?.studentDetails?.experience?.map((exp, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{exp.role}</Text>
                    <Text style={styles.itemSub}>{exp.company} • {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* EDIT BUTTON */}
                    <TouchableOpacity 
                      onPress={() => {
                        setEditingExpIndex(i);
                        setExpForm(exp); // Pre-fill form
                        setActiveModal('experience');
                      }} 
                      style={[styles.deleteBtn, { backgroundColor: '#E3F2FD', marginRight: 8 }]}
                    >
                      <Feather name="edit-2" size={18} color={COLORS.primary} />
                    </TouchableOpacity>

                    {/* DELETE BUTTON */}
                    <TouchableOpacity onPress={() => handleDelete('experience', i)} style={styles.deleteBtn}>
                      <Feather name="trash-2" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            
            {/* ... Rest of your Projects, Skills, and Applications Code ... */}
            {/* PROJECTS READ/DELETE */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Projects</Text>
                <TouchableOpacity onPress={() => setActiveModal('project')}><Feather name="plus-circle" size={22} color={COLORS.secondary} /></TouchableOpacity>
              </View>
              {profile?.projects?.map((proj, i) => (
                <View key={i} style={styles.listItem}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push({ pathname: '/(roles)/student/StudentProjectScreen', params: { projectId: proj._id } })}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.itemTitle}>{proj.title}</Text>
                      <Feather name="chevron-right" size={16} color={COLORS.text.secondary} />
                    </View>
                    <Text style={styles.itemSub} numberOfLines={1}>{proj.tags?.join(' • ')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete('project', proj._id)} style={styles.deleteBtn}>
                    <Feather name="trash-2" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* SKILLS CRUD */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Tech Stack</Text>
                <TouchableOpacity onPress={() => setActiveModal('skill')}><Feather name="plus-circle" size={22} color={COLORS.secondary} /></TouchableOpacity>
              </View>
              <View style={styles.skillsGrid}>
                {profile?.studentDetails?.skills?.map((skill, i) => (
                  <View key={i} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                    <TouchableOpacity onPress={() => handleDelete('skill', i)} style={{ marginLeft: 6 }}>
                      <Feather name="x" size={14} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* MY APPLICATIONS (NOW CLICKABLE & ROUTES TO JOB DETAILS/COMPANY) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>My Job Applications</Text>
              </View>
              {applications.filter(app => app.status === 'applied' || app.status === 'interviewing').length > 0 ? (
                applications.filter(app => app.status === 'applied' || app.status === 'interviewing').map((app, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.listItem}
                    onPress={() => router.push({ pathname: '/(roles)/student/JobDetailScreen', params: { jobId: app.job?._id } })}
                  >
                    <View style={styles.rowBetween}>
                      {/* ✅ FIX: Added flex: 1 and numberOfLines to prevent overlap */}
                      <Text style={[styles.itemTitle, { flex: 1, marginRight: 10 }]} numberOfLines={1}>
                        {app.job?.title}
                      </Text>
                      <View style={{ backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '700' }}>{app.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.itemSub, { flex: 1 }]} numberOfLines={1}>
                        {app.job?.postedBy?.companyDetails?.companyName || 'Company'}
                      </Text>
                      <Feather name="chevron-right" size={16} color={COLORS.text.secondary} />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: COLORS.text.secondary, fontStyle: 'italic', marginTop: 10 }}>You haven't applied to any jobs yet.</Text>
              )}
            </View>

            {/* ACCEPTED OFFERS */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Accepted Offers 🎉</Text>
              </View>
              {applications.filter(app => app.status === 'accepted').length > 0 ? (
                applications.filter(app => app.status === 'accepted').map((app, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.listItem}
                    onPress={() => router.push({ pathname: '/(roles)/student/JobDetailScreen', params: { jobId: app.job?._id } })}
                  >
                    <View style={styles.rowBetween}>
                      {/* ✅ FIX: Added flex: 1 and numberOfLines to prevent overlap */}
                      <Text style={[styles.itemTitle, { flex: 1, marginRight: 10 }]} numberOfLines={1}>
                        {app.job?.title}
                      </Text>
                      <Feather name="check-circle" size={18} color="#4CAF50" />
                    </View>
                    <Text style={[styles.itemSub, { flex: 1 }]} numberOfLines={1}>
                      {app.job?.postedBy?.companyDetails?.companyName || 'Company'}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: COLORS.text.secondary, fontStyle: 'italic', marginTop: 10 }}>No accepted offers yet. Keep applying!</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* POP-UP FORM MODAL */}
      <Modal visible={!!activeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeModal === 'experience' && editingExpIndex !== null ? 'Edit Experience' : `Add ${activeModal}`}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><Feather name="x" size={24} color={COLORS.primary} /></TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {activeModal === 'experience' && (
                  <View style={styles.modalForm}>
                    <Text style={styles.inputLabel}>Role / Job Title</Text>
                    <TextInput style={styles.modalInput} placeholder="e.g. Frontend Intern" value={expForm.role} onChangeText={t => setExpForm({...expForm, role: t})} />
                    
                    <Text style={styles.inputLabel}>Company Name</Text>
                    <TextInput style={styles.modalInput} placeholder="e.g. Google" value={expForm.company} onChangeText={t => setExpForm({...expForm, company: t})} />
                    
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.inputLabel}>Start Date</Text>
                        <TextInput style={styles.modalInput} placeholder="Jan 2023" value={expForm.startDate} onChangeText={t => setExpForm({...expForm, startDate: t})} />
                      </View>
                      
                      {!expForm.isCurrent && (
                        <View style={{ flex: 1 }}>
                          <Text style={styles.inputLabel}>End Date</Text>
                          <TextInput style={styles.modalInput} placeholder="Dec 2023" value={expForm.endDate} onChangeText={t => setExpForm({...expForm, endDate: t})} />
                        </View>
                      )}
                    </View>

                    <View style={styles.switchRow}>
                      <Switch 
                        value={expForm.isCurrent} 
                        onValueChange={val => setExpForm({...expForm, isCurrent: val, endDate: val ? 'Present' : ''})} 
                        trackColor={{ false: COLORS.border, true: COLORS.primary }}
                      />
                      <Text style={styles.switchText}>I am currently working here</Text>
                    </View>

                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput style={[styles.modalInput, {height: 80}]} multiline placeholder="Describe your responsibilities..." value={expForm.description} onChangeText={t => setExpForm({...expForm, description: t})} />
                  </View>
                )}
                {activeModal === 'skill' && <TextInput style={styles.modalInput} placeholder="e.g. React Native" value={skillInput} onChangeText={setSkillInput} />}
                {activeModal === 'project' && (
                  <View style={styles.modalForm}>
                    <TextInput style={styles.modalInput} placeholder="Project Title" value={projectForm.title} onChangeText={t => setProjectForm({...projectForm, title: t})} />
                    <TextInput style={styles.modalInput} placeholder="Tags (comma separated)" value={projectForm.tags} onChangeText={t => setProjectForm({...projectForm, tags: t})} />
                    <TextInput style={[styles.modalInput, {height: 80}]} multiline placeholder="Short Description" value={projectForm.description} onChangeText={t => setProjectForm({...projectForm, description: t})} />
                  </View>
                )}
            </ScrollView>

            <PrimaryButton title="Save Entry" onPress={() => handleAddData(activeModal)} isLoading={isSubmitting} />
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
  
  menuOverlayMenu: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  menuDropdown: { position: 'absolute', right: 20, backgroundColor: COLORS.surface, borderRadius: 12, width: 180, elevation: 5, shadowOpacity: 0.1, borderWidth: 1, borderColor: COLORS.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuText: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  menuDivider: { height: 1, backgroundColor: COLORS.border },
  header: { alignItems: 'center', padding: 30, backgroundColor: COLORS.surface, marginBottom: 10 },
  
  // AVATAR & UPLOAD BADGE
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 5 },
  profileImage: { width: '100%', height: '100%', borderRadius: 45 }, 
  avatarText: { fontSize: 36, color: COLORS.surface, fontWeight: 'bold' },
  editImageBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.secondary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },

  name: { fontSize: 24, fontWeight: '800', color: COLORS.text.primary },
  university: { fontSize: 14, color: COLORS.text.secondary, marginTop: 4 },
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  
  // LIST ITEMS & CRUD
  listItem: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: 4 },
  itemSub: { fontSize: 13, color: COLORS.text.secondary, marginTop: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 },
  deleteBtn: { padding: 8, backgroundColor: '#FFEBEE', borderRadius: 8, marginLeft: 10 },
  
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  skillText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  

  // 
  // NEW STYLES FOR STRENGTH CARD
  strengthCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4, borderLeftColor: COLORS.secondary },
  strengthScore: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  progressBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginVertical: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  suggestionsBox: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, gap: 8, marginTop: 8 },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  suggestionText: { flex: 1, fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },
  
  // MODALS
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary, marginBottom: 6, marginLeft: 4 },
  modalInput: { backgroundColor: COLORS.background, borderRadius: 12, padding: 16, fontSize: 15, color: COLORS.text.primary, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, textAlignVertical: 'top' },
  modalForm: { gap: 2 },
  
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  switchText: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: COLORS.text.primary },

  actionRequiredCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  actionIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${COLORS.primary}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  actionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 8, textAlign: 'center' },
  actionSub: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 }
});