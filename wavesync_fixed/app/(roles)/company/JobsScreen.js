import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../src/theme/colors';
import api from '../../../src/services/api';

export default function JobsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobsAndApplicants();
  }, []);

  const fetchJobsAndApplicants = async () => {
    try {
      // Fetch both Jobs and Applicants at the same time
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs/company'),
        api.get('/jobs/company/applicants')
      ]);

      // Count how many applicants belong to each job
      const applicantCounts = {};
      appsRes.data.forEach(app => {
        const jId = app.job?._id || app.job;
        applicantCounts[jId] = (applicantCounts[jId] || 0) + 1;
      });

      // Merge the count into the jobs array
      const formattedJobs = jobsRes.data.map(job => ({
        ...job,
        applicantCount: applicantCounts[job._id] || 0
      }));

      setJobs(formattedJobs);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    // If it's currently 'open', make it 'closed', else make it 'open'
    const newStatus = currentStatus.toLowerCase() === 'open' ? 'closed' : 'open';

    // 1. Optimistic UI Update (Update screen instantly)
    setJobs(prevJobs => prevJobs.map(job => 
      job._id === jobId ? { ...job, status: newStatus } : job
    ));

    // 2. Database Update
    try {
      await api.put(`/jobs/${jobId}/status`, { status: newStatus });
    } catch (error) {
      Alert.alert("Error", "Failed to update job status on server.");
      // Revert UI if it fails
      fetchJobsAndApplicants();
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Job Postings</Text>
        <TouchableOpacity 
          style={styles.postBtn}
          onPress={() => router.push('/(roles)/company/PostJobScreen')}
        >
          <Feather name="plus" size={16} color={COLORS.surface} />
          <Text style={styles.postBtnText}>New Job</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {jobs.map((job) => {
          const isActive = job.status.toLowerCase() === 'open';

          return (
            <TouchableOpacity 
              key={job._id} 
              style={[styles.jobCard, !isActive && styles.jobCardInactive]}
              // Clicking the card opens JobDetailScreen
              onPress={() => router.push({ pathname: '/(roles)/company/JobDetailScreen', params: { jobId: job._id } })}
            >
              
              {/* TOP ROW: Title & Status Toggle */}
              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.jobTitle, !isActive && styles.textInactive]} numberOfLines={1}>
                    {job.title}
                  </Text>
                  
                  {/* ✅ FIX: Added numberOfLines={1} here to protect against super long locations */}
                  <Text style={styles.jobSub} numberOfLines={1}>
                    {job.jobType} • {job.location || 'Remote'}
                  </Text>
                </View>

                {/* Status Toggle Switch */}
                <View style={styles.toggleContainer}>
                  <Text style={[styles.statusText, { color: isActive ? COLORS.secondary : COLORS.text.secondary }]}>
                    {isActive ? 'Active' : 'Closed'}
                  </Text>
                  {/* Stop propagation so clicking the switch doesn't open the card */}
                  <View onStartShouldSetResponder={() => true}>
                    <Switch 
                      value={isActive} 
                      onValueChange={() => toggleJobStatus(job._id, job.status)}
                      trackColor={{ false: COLORS.border, true: `${COLORS.secondary}50` }}
                      thumbColor={isActive ? COLORS.secondary : COLORS.background}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* BOTTOM ROW: Actions & Applicant Count */}
              <View style={styles.cardFooter}>
                <View style={styles.applicantBadge}>
                  <Feather name="users" size={14} color={COLORS.primary} />
                  <Text style={styles.applicantText}>{job.applicantCount} Candidates</Text>
                </View>

                <View style={styles.actionButtons}>
                  <View style={styles.primaryActionBtn}>
                    <Text style={styles.primaryActionText}>View Details</Text>
                    <Feather name="chevron-right" size={16} color={COLORS.primary} />
                  </View>
                </View>
              </View>

            </TouchableOpacity>
          );
        })}

        {jobs.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Jobs Posted Yet</Text>
            <Text style={styles.emptySub}>Create your first job listing to start finding top talent.</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  postBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  postBtnText: { color: COLORS.surface, fontWeight: '700', fontSize: 13, marginLeft: 4 },
  
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  jobCard: { backgroundColor: COLORS.surface, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  jobCardInactive: { opacity: 0.75, backgroundColor: '#FAFAFA' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20 },
  titleContainer: { flex: 1, paddingRight: 12 },
  jobTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary, marginBottom: 4 },
  textInactive: { color: COLORS.text.secondary },
  jobSub: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '500' },
  
  toggleContainer: { alignItems: 'center' },
  statusText: { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  
  divider: { height: 1, backgroundColor: COLORS.border },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  applicantBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.primary}10`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  applicantText: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginLeft: 6 },
  
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  primaryActionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: `${COLORS.primary}10` },
  primaryActionText: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginRight: 4 },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 20 }
});