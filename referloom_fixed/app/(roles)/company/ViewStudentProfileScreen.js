import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../src/theme/colors';
import api from '../../../src/services/api';

export default function ViewStudentProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // ✅ FIX: Extract fitScore from params so the badge shows the real match percentage
  const { studentId, fitScore } = useLocalSearchParams(); 

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: Fetch real student data from the database
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`/users/${studentId}`);
        setStudent(response.data);
      } catch (error) {
        console.error("Failed to load student", error);
        Alert.alert("Error", "Could not load candidate profile.");
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchStudent();
  }, [studentId]);

  if (loading || !student) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  const details = student.studentDetails || {};

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Candidate Profile</Text>
        <TouchableOpacity style={styles.menuBtn}>
          <Feather name="more-horizontal" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PROFILE HEADER CARD */}
        <View style={styles.profileCard}>
          <View style={styles.topRow}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{student.fullName?.charAt(0)}</Text>
            </View>
            
            {/* Show Fit Score only if it was passed from the previous screen */}
            {fitScore && (
              <View style={styles.scoreBadge}>
                <Feather name="zap" size={14} color={COLORS.surface} style={{marginRight: 4}} />
                <Text style={styles.scoreText}>{fitScore}% Match</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.name} numberOfLines={1}>{student.fullName}</Text>
          <Text style={styles.headline}>{student.headline || details.course || 'Student'}</Text>
          
          {/* ACTION QUICK LINKS */}
          <View style={styles.quickLinksRow}>
            <TouchableOpacity style={styles.quickLinkBtn}>
              <Feather name="file-text" size={16} color={COLORS.secondary} />
              <Text style={styles.quickLinkText}>View Resume</Text>
            </TouchableOpacity>
            
            {student.projects?.some(p => p.githubUrl) && (
              <TouchableOpacity style={styles.quickLinkBtn}>
                <Feather name="github" size={16} color={COLORS.text.secondary} />
                <Text style={[styles.quickLinkText, {color: COLORS.text.secondary}]}>GitHub</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ABOUT SECTION */}
        {student.bio && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About Candidate</Text>
            <Text style={styles.bodyText}>{student.bio}</Text>
          </View>
        )}

        {/* SKILLS SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Verified Skills</Text>
          <View style={styles.skillsGrid}>
            {details.skills?.length > 0 ? details.skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill}</Text>
              </View>
            )) : <Text style={{color: COLORS.text.secondary}}>No skills listed.</Text>}
          </View>
        </View>

        {/* EXPERIENCE SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {details.experience?.length > 0 ? details.experience.map((exp, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listIconBox}>
                <Feather name="briefcase" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle} numberOfLines={1}>{exp.role}</Text>
                <Text style={styles.listSub} numberOfLines={1}>{exp.company} • {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</Text>
              </View>
            </View>
          )) : <Text style={{color: COLORS.text.secondary}}>No experience listed.</Text>}
        </View>

        {/* PROJECTS SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {student.projects?.length > 0 ? student.projects.map((proj, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listIconBox}>
                <Feather name="folder" size={18} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle} numberOfLines={1}>{proj.title}</Text>
                <Text style={styles.listSub} numberOfLines={2}>{proj.description}</Text>
              </View>
            </View>
          )) : <Text style={{color: COLORS.text.secondary}}>No projects listed.</Text>}
        </View>

      </ScrollView>

      {/* STICKY ACTION FOOTER */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Feather name="bookmark" size={20} color={COLORS.primary} />
          <Text style={styles.secondaryBtnText}>Shortlist</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert("Coming Soon", "Direct messaging and interview scheduling will be available soon.")}>
          <Text style={styles.primaryBtnText}>Message / Invite</Text>
          <Feather name="send" size={18} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  menuBtn: { padding: 8, marginRight: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  
  scrollContent: { padding: 20, paddingBottom: 100 }, 
  
  profileCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  avatarPlaceholder: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: COLORS.surface },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  scoreText: { fontSize: 13, fontWeight: '800', color: COLORS.surface },
  
  name: { fontSize: 24, fontWeight: '800', color: COLORS.text.primary, marginBottom: 4 },
  headline: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 20, marginBottom: 20 },
  
  quickLinksRow: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderColor: COLORS.border },
  quickLinkBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  quickLinkText: { fontSize: 13, fontWeight: '700', color: COLORS.secondary, marginLeft: 6 },

  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 12 },
  bodyText: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 22 },
  
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  skillChipText: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary },

  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  listIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: `${COLORS.primary}10`, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  listTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, marginBottom: 2 },
  listSub: { fontSize: 13, color: COLORS.text.secondary },

  stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border, gap: 12 },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: `${COLORS.primary}10` },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginLeft: 8 },
  primaryBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.secondary },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.surface, marginRight: 8 }
});