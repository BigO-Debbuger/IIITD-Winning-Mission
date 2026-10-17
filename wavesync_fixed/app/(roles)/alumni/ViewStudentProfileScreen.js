import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Image, Modal, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../src/theme/colors';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';

export default function ViewStudentProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { studentId } = useLocalSearchParams();
  
  const [profile, setProfile] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      // 1. Fetch the Student's Profile
      const studentRes = await api.get(`/users/${studentId}`);
      setProfile(studentRes.data);

      // 2. Fetch the Alumni's active jobs so they can choose which one to refer the student to
      const jobsRes = await api.get('/jobs/company'); // Alumni use the same job controller
      setMyJobs(jobsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefer = async (jobId) => {
    setIsSubmitting(true);
    try {
      await api.post('/referrals/refer', {
        studentId: studentId,
        jobId: jobId
      });
      Alert.alert("Referral Sent! 🚀", "This student has been pushed to the top of your HR pipeline.");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to refer candidate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!profile) return <View style={styles.center}><Text>Student not found.</Text></View>;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Candidate Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* BASIC INFO */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatar}>
            {profile.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{profile.fullName?.charAt(0)}</Text>
            )}
          </View>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.course}>{profile.studentDetails?.course || 'Student'}</Text>
        </View>

        {/* SKILLS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tech Stack</Text>
          <View style={styles.skillsGrid}>
            {profile.studentDetails?.skills?.map((skill, i) => (
              <View key={i} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* EXPERIENCE */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {profile.studentDetails?.experience?.map((exp, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.itemTitle}>{exp.role}</Text>
              <Text style={styles.itemSub}>{exp.company} • {exp.duration}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="star-shooting" size={18} color="#FFF" />
          <Text style={styles.primaryText}>Refer Candidate</Text>
        </TouchableOpacity>
      </View>

      {/* REFERRAL MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Job to Refer</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {myJobs.length === 0 ? (
                <Text style={{ textAlign: 'center', color: COLORS.text.secondary, marginTop: 20 }}>
                  You haven't posted any jobs yet.
                </Text>
              ) : (
                myJobs.map((job) => (
                  <TouchableOpacity 
                    key={job._id} 
                    style={styles.jobItem}
                    onPress={() => handleRefer(job._id)}
                    disabled={isSubmitting}
                  >
                    <View>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.jobType}>{job.jobType}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  profileHeaderCard: { alignItems: 'center', backgroundColor: COLORS.surface, padding: 30, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 40 },
  avatarText: { fontSize: 32, color: COLORS.surface, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary, marginBottom: 4 },
  course: { fontSize: 14, color: COLORS.text.secondary, fontWeight: '500' },

  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 12 },
  
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: `${COLORS.secondary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skillText: { fontSize: 13, fontWeight: '600', color: COLORS.secondary },

  listItem: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  itemTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  itemSub: { fontSize: 13, color: COLORS.text.secondary, marginTop: 4 },

  footer: { flexDirection: 'row', padding: 20, backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border, gap: 12 },
  secondaryBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  secondaryText: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  primaryBtn: { flex: 2, flexDirection: 'row', backgroundColor: '#FF9800', paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  primaryText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  jobItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  jobTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, marginBottom: 4 },
  jobType: { fontSize: 13, color: COLORS.text.secondary }
});