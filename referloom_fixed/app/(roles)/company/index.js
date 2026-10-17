import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { COLORS } from '../../../src/theme/colors';
import api from '../../../src/services/api';

export default function CompanyDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // 1. ALL HOOKS FIRST
  const [liveUser, setLiveUser] = useState(user);
  const [activeJobs, setActiveJobs] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. LOGOUT SAFETY CHECK
  if (!user) return null;

  const isComplete = liveUser?.isProfileComplete;
  const companyName = liveUser?.companyDetails?.companyName || liveUser?.fullName || 'Your Company';

  // 3. FETCH FRESH DATA ON LOAD
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // First, fetch the absolute freshest profile
      const profileRes = await api.get('/users/profile');
      const freshData = profileRes.data;
      setLiveUser(freshData);

      // Only fetch the rest if they are complete
      if (freshData.isProfileComplete) {
        const jobRes = await api.get('/jobs/company');
        setActiveJobs(jobRes.data.slice(0, 2)); // Show top 2 active jobs

        const appRes = await api.get('/jobs/company/applicants');
        // Show top 3 recent direct applicants
        const recentApplicants = appRes.data.filter(app => app.status === 'applied').slice(0, 3);
        setTopCandidates(recentApplicants);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.companyName}>{companyName}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Feather name="bell" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 🚨 PROFILE GUARD CARD - Protected from flashing! */}
        {!loading && liveUser && !isComplete && (
          <View style={styles.guardCard}>
            <View style={styles.guardIconBox}>
              <Feather name="shield" size={32} color={COLORS.primary} />
            </View>
            <View style={{flex: 1, marginLeft: 16}}>
              <Text style={styles.guardTitle}>Complete Setup</Text>
              <Text style={styles.guardSub}>Finish your profile to post jobs and see real AI matches.</Text>
              <TouchableOpacity style={styles.guardBtn} onPress={() => router.push('/(roles)/company/CompanyProfileScreen')}>
                <Text style={styles.guardBtnText}>Complete Now</Text>
                <Feather name="arrow-right" size={14} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* QUICK ACTIONS SECTION */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={[styles.actionCard, !isComplete && styles.disabledCard]} disabled={!isComplete} onPress={() => router.push('/(roles)/company/PostJobScreen')}>
            <View style={[styles.iconCircle, { backgroundColor: isComplete ? `${COLORS.secondary}15` : COLORS.border }]}>
              <Feather name="plus" size={24} color={isComplete ? COLORS.secondary : COLORS.text.secondary} />
            </View>
            <Text style={styles.actionText}>Post a Job</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, !isComplete && styles.disabledCard]} disabled={!isComplete} onPress={() => router.push('/(roles)/company/JobApplicantsScreen')}>
            <View style={[styles.iconCircle, { backgroundColor: isComplete ? `${COLORS.primary}10` : COLORS.border }]}>
              <Feather name="users" size={24} color={isComplete ? COLORS.primary : COLORS.text.secondary} />
            </View>
            <Text style={styles.actionText}>Applications</Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVE JOBS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Jobs Overview</Text>
          <TouchableOpacity disabled={!isComplete} onPress={() => router.push('/(roles)/company/JobsScreen')}>
            <Text style={[styles.seeAllText, !isComplete && {color: COLORS.border}]}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? <ActivityIndicator color={COLORS.primary} /> : activeJobs.map((job) => (
          <TouchableOpacity key={job._id} style={[styles.jobCard, !isComplete && {opacity: 0.5}]} disabled={!isComplete} onPress={() => router.push({ pathname: '/(roles)/company/JobDetailScreen', params: { jobId: job._id } })}>
            <View style={styles.jobInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
              <Text style={styles.jobSub}>{job.jobType}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.border} />
          </TouchableOpacity>
        ))}

        {/* TOP CANDIDATES SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Direct Applicants</Text>
          <TouchableOpacity disabled={!isComplete} onPress={() => router.push('/(roles)/company/JobApplicantsScreen')}>
            <Text style={[styles.seeAllText, !isComplete && {color: COLORS.border}]}>View ATS</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator color={COLORS.primary} /> : topCandidates.map((app) => (
          <TouchableOpacity key={app._id} style={[styles.jobCard, !isComplete && {opacity: 0.5}]} disabled={!isComplete} onPress={() => router.push({ pathname: '/(roles)/company/ViewStudentProfileScreen', params: { studentId: app.student._id } })}>
            <View style={styles.jobInfo}>
              <Text style={styles.jobTitle}>{app.student?.fullName}</Text>
              <Text style={styles.jobSub}>Applied for: {app.job?.title}</Text>
            </View>
            <View style={styles.applicantBadge}>
              <Text style={styles.applicantText}>{app.fitScore || 85}% Match</Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

// ... (Keep the exact styles from your company/index.js)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  greeting: { fontSize: 14, color: COLORS.text.secondary, marginBottom: 2 },
  companyName: { fontSize: 22, fontWeight: '800', color: COLORS.primary, letterSpacing: -0.5 },
  notificationBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  scrollContent: { padding: 20, paddingBottom: 40 },
  guardCard: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 20, borderRadius: 20, borderWidth: 2, borderColor: COLORS.primary, marginBottom: 24, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  guardIconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: `${COLORS.primary}10`, justifyContent: 'center', alignItems: 'center' },
  guardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  guardSub: { fontSize: 13, color: COLORS.text.secondary, marginBottom: 12, lineHeight: 18 },
  guardBtn: { alignSelf: 'flex-start', flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: 'center', gap: 6 },
  guardBtnText: { color: COLORS.surface, fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12, marginTop: 24 },
  seeAllText: { fontSize: 14, fontWeight: '700', color: COLORS.secondary, marginBottom: 2 },
  quickActionsRow: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  disabledCard: { opacity: 0.6, backgroundColor: COLORS.background },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionText: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  jobCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  jobInfo: { flex: 1, paddingRight: 12 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, marginBottom: 4 },
  jobSub: { fontSize: 13, color: COLORS.text.secondary },
  applicantBadge: { backgroundColor: `${COLORS.primary}10`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 12 },
  applicantText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
});