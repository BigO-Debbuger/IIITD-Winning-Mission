import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { COLORS } from '../../../src/theme/colors';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';
import FitScoreBadge from '../../../src/components/ui/FitScoreBadge';
import api from '../../../src/services/api';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';

export default function JobDetailScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();

  const [hasApplied, setHasApplied] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      // 🚨 Safety Check: Ensure jobId is valid
      if (!jobId || typeof jobId !== 'string') {
        setLoading(false);
        return;
      }

      try {
        // Fetch Job Details AND Application Status at the same time for speed
        const [jobRes, appsRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get('/jobs/my-applications')
        ]);

        setJob(jobRes.data);

        // Check if the student has already applied for this specific job
        const alreadyApplied = appsRes.data.some(app => app.job?._id === jobId);
        setHasApplied(alreadyApplied);

      } catch (err) {
        console.error("Axios Error on Job Detail:", err);
        Toast.show({ 
          type: 'error', 
          text1: 'Job Not Found', 
          text2: 'This job may have been closed or removed.' 
        });
        router.back(); 
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/jobs/${job._id}/apply`);
      setHasApplied(true); // Instantly update UI
      Toast.show({
        type: 'success',
        text1: 'Application Sent!',
        text2: 'Recruiter can now view your profile 🚀',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Application Failed',
        text2: err.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading || !job) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <ScreenWrapper>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Role Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {/* JOB HEADER */}
          <View style={styles.jobHeader}>
            <View style={styles.companyRow}>
              <View style={styles.logoBox}>
                <Feather name="briefcase" size={20} color={COLORS.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.companyName}>
                  {job.companyName} • {job.location}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Feather name="briefcase" size={14} color={COLORS.primary} />
                <Text style={styles.metaText}>{job.jobType}</Text>
              </View>

              <View style={styles.metaBadge}>
                <Feather name="clock" size={14} color={COLORS.text.secondary} />
                <Text style={styles.metaText}>Posted {postedDate}</Text>
              </View>

              <View style={styles.hiringBadge}>
                <Text style={styles.hiringText}>Actively Hiring</Text>
              </View>
            </View>
          </View>

          {/* DYNAMIC AI SECTION */}
          <View style={styles.aiSection}>
            <View style={styles.aiTop}>
              <FitScoreBadge score={job.fitScore} size={80} />

              <View style={{ marginLeft: 16 }}>
                <Text style={styles.aiTitle}>Your Match Score</Text>

                <Text style={styles.matchLabel}>
                  {job.fitScore >= 85
                    ? '🔥 Strong Match'
                    : job.fitScore >= 60
                    ? '👍 Good Match'
                    : '⚡ Needs Improvement'}
                </Text>
              </View>
            </View>

            {/* Render Dynamic AI Suggestions from Backend */}
            {job.aiSuggestions?.length > 0 && (
              <>
                <Text style={styles.suggestionsTitle}>Improve your chances:</Text>

                {job.aiSuggestions.map((s, i) => (
                  <View key={i} style={styles.suggestionRow}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#FF9800" style={{ marginTop: 2 }} />
                    <Text style={styles.suggestionText}>{s}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* INSIGHT */}
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Why this job fits you</Text>
            <Text style={styles.insightText}>
              Based on your projects and skills, you align well with this role.
              Applying increases your chances of getting noticed.
            </Text>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>About the Role</Text>
            <Text style={styles.description}>{job.description}</Text>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              Required Skills
            </Text>

            <View style={styles.tagsContainer}>
              {job.requirements?.map((skill, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>

        {/* CTA */}
        <View style={styles.footer}>
          <PrimaryButton
            title={hasApplied ? "Application Submitted ✅" : "Apply & Get Noticed 🚀"}
            onPress={handleApply}
            isLoading={applying}
            disabled={hasApplied} 
            style={hasApplied ? { backgroundColor: '#ccc' } : {}}
          />
        </View>

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 40, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  jobHeader: { marginBottom: 24 },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: `${COLORS.primary}15`, justifyContent: 'center', alignItems: 'center' },
  jobTitle: { fontSize: 22, fontWeight: 'bold' },
  companyName: { color: COLORS.text.secondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  metaBadge: { flexDirection: 'row', backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  metaText: { marginLeft: 6, fontSize: 12 },
  hiringBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  hiringText: { fontSize: 12, color: '#2E7D32', fontWeight: '700' },
  aiSection: { backgroundColor: '#EEF4FF', padding: 20, borderRadius: 20, marginBottom: 20 },
  aiTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiTitle: { fontSize: 16, fontWeight: '700' },
  matchLabel: { marginTop: 4, color: COLORS.primary, fontWeight: '600' },
  suggestionsTitle: { marginTop: 10, fontWeight: '700' },
  suggestionRow: { flexDirection: 'row', marginTop: 10, paddingRight: 10 },
  suggestionText: { marginLeft: 8, color: COLORS.text.secondary, lineHeight: 20, flex: 1 },
  insightCard: { backgroundColor: '#FFF8E1', padding: 16, borderRadius: 16, marginBottom: 20 },
  insightTitle: { fontWeight: '700', marginBottom: 6 },
  insightText: { color: COLORS.text.secondary, lineHeight: 20 },
  detailsSection: { paddingBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  description: { marginTop: 6, color: COLORS.text.secondary, lineHeight: 20 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  tag: { backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 12 },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: COLORS.border }
});