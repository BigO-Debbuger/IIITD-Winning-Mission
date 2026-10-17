import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../src/theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function JobDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobId } = useLocalSearchParams();
  
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [aiMatches, setAiMatches] = useState([]); // ✅ NEW: AI Suggested Students
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      // ✅ Fetch Job, Applicants, and AI Matches simultaneously for speed
      const [jobRes, appRes, matchRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get('/jobs/company/applicants'),
        api.get(`/jobs/${jobId}/matches`).catch(() => ({ data: [] })) // Fallback if route isn't ready
      ]);

      setJob(jobRes.data);

      // Filter applicants specifically for this job who are newly 'applied'
      const directApplicants = appRes.data.filter(app => app.job._id === jobId && app.status === 'applied');
      setApplicants(directApplicants);

      // Set AI Matches (Sourcing)
      setAiMatches(matchRes.data);

    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  const handleAcceptToInterview = async (applicationId) => {
    try {
      await api.put(`/jobs/company/applications/${applicationId}/status`, { status: 'interviewing' });
      Alert.alert("Shortlisted!", "Candidate moved to the ATS Pipeline (Interviewing).");
      // Remove from the 'new' list instantly
      setApplicants(prev => prev.filter(app => app._id !== applicationId));
    } catch (error) {
      Alert.alert("Error", "Failed to shortlist candidate.");
    }
  };

  const filteredApplicants = filter === 'All' ? applicants : 
                             filter === 'Top Matches' ? applicants.filter(a => (a.fitScore || 85) >= 80) :
                             applicants.filter(a => a.isReferred);

  if (loading || !job) return <ActivityIndicator style={{marginTop: 50}} color={COLORS.primary} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Role Management</Text>
        <TouchableOpacity style={styles.menuBtn}>
          <Feather name="more-horizontal" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* JOB CONTEXT CARD */}
        <View style={styles.jobContextCard}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <View style={styles.jobMetaRow}>
            <Feather name="map-pin" size={14} color={COLORS.text.secondary} />
            <Text style={styles.jobMetaText}>{job.location || 'Remote'}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.jobMetaText}>{job.jobType}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={[styles.jobMetaText, { color: COLORS.primary, fontWeight: '700' }]}>{job.status.toUpperCase()}</Text>
          </View>
          
          <Text style={styles.jobDescription} numberOfLines={3}>{job.description}</Text>

          <View style={styles.skillsRow}>
            {job.requirements?.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ✅ NEW: AI SOURCING (TOP MATCHES WHO HAVEN'T APPLIED) */}
        <Text style={styles.sectionTitle}>AI Suggested Candidates</Text>
        <Text style={styles.sectionSub}>Top matches you should invite to apply.</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalMatches}>
          {aiMatches.length > 0 ? aiMatches.map((match) => (
            <TouchableOpacity 
              key={match.student._id} 
              style={styles.aiMatchCard}
              onPress={() => router.push({ pathname: '/(roles)/company/ViewStudentProfileScreen', params: { studentId: match.student._id } })}
            >
              <View style={styles.matchScoreBox}>
                <Text style={styles.matchScoreText}>🔥 {match.fitScore}% Match</Text>
              </View>
              <Text style={styles.matchName} numberOfLines={1}>{match.student.fullName}</Text>
              <Text style={styles.matchCourse} numberOfLines={1}>{match.student.studentDetails?.course || 'Student'}</Text>
              <Text style={styles.viewProfileBtn}>View Profile →</Text>
            </TouchableOpacity>
          )) : (
            <View style={styles.noMatchBox}>
              <Text style={{ color: COLORS.text.secondary }}>No AI matches available right now.</Text>
            </View>
          )}
        </ScrollView>

        {/* ========================================================= */}
        {/* APPLICANT TRACKER SECTION */}
        {/* ========================================================= */}
        
        <View style={styles.applicantHeaderRow}>
          <Text style={styles.sectionTitle}>New Applications</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{applicants.length}</Text>
          </View>
        </View>

        {/* FILTER TABS */}
        <View style={styles.filterContainer}>
          {['All', 'Top Matches', 'Referred'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={[styles.filterTab, filter === tab && styles.filterTabActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* APPLICANT LIST */}
        {/* APPLICANT LIST */}
        {filteredApplicants.map((app) => (
          <TouchableOpacity 
            key={app._id} 
            style={styles.applicantCard}
            onPress={() => router.push({ pathname: '/(roles)/company/ViewStudentProfileScreen', params: { studentId: app.student._id } })}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{app.student?.fullName?.charAt(0)}</Text>
              </View>
              
              <View style={styles.applicantInfo}>
                {/* ✅ FIX: Added numberOfLines={1} here */}
                <Text style={styles.applicantName} numberOfLines={1}>
                  {app.student?.fullName}
                </Text>
                <Text style={styles.applicantHeadline} numberOfLines={1}>
                  {app.student?.studentDetails?.course}
                </Text>
                
                {app.isReferred && (
                  <View style={styles.referralBadge}>
                    <Feather name="award" size={12} color={COLORS.primary} />
                    <Text style={styles.referralText}>Alumni Referral</Text>
                  </View>
                )}
              </View>

              {/* FIT SCORE BADGE */}
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreText, { color: (app.fitScore || 85) >= 80 ? COLORS.secondary : COLORS.error }]}>
                  {app.fitScore || 85}%
                </Text>
                <Text style={styles.scoreLabel}>Match</Text>
              </View>
            </View>
            
            <View style={styles.cardDivider} />
            
            <View style={styles.cardActionRow}>
              <TouchableOpacity onPress={() => router.push({ pathname: '/(roles)/company/ViewStudentProfileScreen', params: { studentId: app.student._id } })}>
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
              
              {/* ACCEPT BUTTON */}
              <TouchableOpacity 
                onPress={() => handleAcceptToInterview(app._id)} 
                style={styles.acceptBtn}
              >
                 <Text style={styles.acceptBtnText}>Accept to Interview</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filteredApplicants.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={50} color={COLORS.border} />
            <Text style={styles.emptyText}>No new candidates match this filter.</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  menuBtn: { padding: 8, marginRight: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  jobContextCard: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  jobTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginBottom: 8 },
  jobMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  jobMetaText: { fontSize: 13, color: COLORS.text.secondary, marginLeft: 4, fontWeight: '600' },
  metaDot: { color: COLORS.text.secondary, marginHorizontal: 8 },
  jobDescription: { fontSize: 14, color: COLORS.text.secondary, marginBottom: 16, lineHeight: 20 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: `${COLORS.secondary}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  skillText: { fontSize: 12, fontWeight: '700', color: COLORS.secondary },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: COLORS.text.secondary, marginBottom: 16 },
  
  // AI Matches Horizontal Scroll
  horizontalMatches: { marginBottom: 32 },
  aiMatchCard: { width: 160, backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginRight: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  matchScoreBox: { backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 10 },
  matchScoreText: { color: '#2E7D32', fontWeight: '800', fontSize: 11 },
  matchName: { fontSize: 15, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 4 },
  matchCourse: { fontSize: 12, color: COLORS.text.secondary, marginBottom: 12 },
  viewProfileBtn: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  noMatchBox: { padding: 20, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },

  applicantHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  countBadge: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  countText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  filterContainer: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  filterTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  filterTextActive: { color: COLORS.surface, fontWeight: '700' },
  
  applicantCard: { backgroundColor: COLORS.surface, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  cardTopRow: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 20, fontWeight: '700', color: COLORS.surface },
  applicantInfo: { flex: 1, paddingRight: 12 },
  applicantName: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary, marginBottom: 4 },
  applicantHeadline: { fontSize: 13, color: COLORS.text.secondary, marginBottom: 6 },
  referralBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.primary}10`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  referralText: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginLeft: 4 },
  
  scoreContainer: { alignItems: 'flex-end', justifyContent: 'center', paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: COLORS.border },
  scoreText: { fontSize: 20, fontWeight: '800' },
  scoreLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text.secondary, textTransform: 'uppercase' },
  
  cardDivider: { height: 1, backgroundColor: COLORS.border },
  cardActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FAFAFA', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  viewProfileText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  acceptBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  acceptBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  
  emptyState: { alignItems: 'center', marginTop: 40, paddingBottom: 40 },
  emptyText: { marginTop: 12, fontSize: 14, color: COLORS.text.secondary, fontWeight: '500' }
});