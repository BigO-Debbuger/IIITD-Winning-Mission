import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, ScrollView, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import api from '../../../src/services/api';
import { COLORS } from '../../../src/theme/colors';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';
import FitScoreBadge from '../../../src/components/ui/FitScoreBadge';

export default function AlumniAIMatchesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matches, setMatches] = useState([]);
  
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // 1. Fetch Alumni's Jobs on Mount
  useEffect(() => {
    fetchMyJobs();
  }, []);

  // 2. Fetch Matches whenever the selected job changes
  useEffect(() => {
    if (selectedJob) {
      fetchMatchesForJob(selectedJob._id);
    }
  }, [selectedJob]);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs/mine');
      setJobs(res.data);
      if (res.data.length > 0) {
        setSelectedJob(res.data[0]); // Default to first job
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchMatchesForJob = async (jobId) => {
    setLoadingMatches(true);
    setMatches([]); // Clear previous matches while loading
    try {
      const res = await api.get(`/jobs/${jobId}/matches`);
      
      // Strict Filter: Only show 80%+ matches as requested
      const topTierMatches = res.data.filter(m => m.fitScore >= 80);
      setMatches(topTierMatches);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleRefer = async (studentId) => {
    try {
      await api.post(`/referrals/refer`, { studentId, jobId: selectedJob._id });
      Alert.alert("Referral Sent! 🚀", "This candidate has been referred. You will see them in your applicants list once they accept.");
      
      // Optionally remove them from the AI matches list once referred
      setMatches(prev => prev.filter(m => m.student._id !== studentId));
    } catch (err) {
      Alert.alert("Notice", err.response?.data?.message || "Failed to refer candidate.");
    }
  };

  // --- UI RENDERING ---

  const renderJobFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filter by Job Post:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {jobs.map(job => {
          const isActive = selectedJob?._id === job._id;
          return (
            <TouchableOpacity 
              key={job._id}
              style={[styles.jobPill, isActive && styles.jobPillActive]}
              onPress={() => setSelectedJob(job)}
            >
              <Text style={[styles.jobPillText, isActive && styles.jobPillTextActive]}>
                {job.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderStudentCard = ({ item }) => {
    const student = item.student;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{student.fullName?.charAt(0) || 'S'}</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.studentName}>{student.fullName}</Text>
              <Text style={styles.matchContextText}>
                Matched for: <Text style={{fontWeight: '700', color: COLORS.primary}}>{selectedJob?.title}</Text>
              </Text>
            </View>
          </View>
          
          <FitScoreBadge score={item.fitScore} size={50} />
        </View>

        <View style={styles.skillsRow}>
          {student.studentDetails?.skills?.slice(0, 4).map((s, i) => (
            <View key={i} style={styles.skillTag}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
          {student.studentDetails?.skills?.length > 4 && (
            <Text style={styles.moreSkillsText}>+{student.studentDetails.skills.length - 4} more</Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => router.push(`/(roles)/alumni/ViewStudentProfileScreen?studentId=${student._id}`)}
          >
            <Feather name="user" size={16} color={COLORS.text.primary} />
            <Text style={styles.secondaryText}> View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => handleRefer(student._id)}>
            <MaterialCommunityIcons name="star-shooting" size={16} color="#FFF" />
            <Text style={styles.primaryText}> Refer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Scouting Hub</Text>
          <View style={{ width: 40 }} />
        </View>

        {loadingJobs ? (
          <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="briefcase-search-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Jobs Posted</Text>
            <Text style={styles.emptyText}>Post a job first to let the AI Engine find top talent for you.</Text>
          </View>
        ) : (
          <>
            {/* JOB FILTERS */}
            {renderJobFilter()}

            {/* MATCHES LIST */}
            {loadingMatches ? (
              <View style={styles.center}><ActivityIndicator size="large" color={COLORS.secondary} /></View>
            ) : (
              <FlatList
                data={matches}
                keyExtractor={(item) => item.student._id}
                renderItem={renderStudentCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="robot-confused-outline" size={60} color={COLORS.border} />
                    <Text style={styles.emptyTitle}>No Strong Matches</Text>
                    <Text style={styles.emptyText}>No students currently have an 80%+ match score for this specific role.</Text>
                  </View>
                }
              />
            )}
          </>
        )}

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

  // FILTER STYLES
  filterContainer: { backgroundColor: COLORS.surface, paddingVertical: 16, borderBottomWidth: 1, borderColor: COLORS.border },
  filterLabel: { paddingHorizontal: 20, fontSize: 13, fontWeight: '700', color: COLORS.text.secondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterScroll: { paddingHorizontal: 16, gap: 10, paddingRight: 30 },
  jobPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  jobPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  jobPillText: { fontSize: 14, fontWeight: '600', color: COLORS.text.secondary },
  jobPillTextActive: { color: COLORS.surface },

  // CARD STYLES
  listContent: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: `${COLORS.secondary}15`, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
  studentName: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginBottom: 2 },
  matchContextText: { fontSize: 12, color: COLORS.text.secondary },
  
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  skillTag: { backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  skillText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  moreSkillsText: { fontSize: 12, color: COLORS.text.secondary, alignSelf: 'center', marginLeft: 4, fontStyle: 'italic' },

  actions: { flexDirection: 'row', gap: 12 },
  secondaryBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  secondaryText: { fontWeight: '700', color: COLORS.text.primary, marginLeft: 6 },
  primaryBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 10, backgroundColor: '#FF9800' }, // Orange for Referrals
  primaryText: { fontWeight: '700', color: '#FFF', marginLeft: 6 },

  // EMPTY STATES
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginTop: 16, marginBottom: 8 },
  emptyText: { textAlign: 'center', color: COLORS.text.secondary, lineHeight: 22 }
});