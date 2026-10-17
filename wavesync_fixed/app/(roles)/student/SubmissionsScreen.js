// wavesync_fixed/app/(roles)/student/SubmissionsScreen.js
// Build-to-Earn: Student's submission list with status indicators.

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS } from '../../../src/theme/colors';
import { getMySubmissions } from '../../../src/services/submission.service';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';

const STATUS_CONFIG = {
  pending:   { label: 'Pending Review', color: '#F59E0B', icon: 'clock',         bg: '#FEF3C7' },
  in_review: { label: 'In Review',      color: '#3B82F6', icon: 'eye',           bg: '#EFF6FF' },
  approved:  { label: 'Approved ✓',     color: '#10B981', icon: 'check-circle',  bg: '#D1FAE5' },
  rejected:  { label: 'Rejected',       color: '#EF4444', icon: 'x-circle',      bg: '#FEE2E2' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Feather name={cfg.icon} size={12} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function SubmissionCard({ submission, onPress }) {
  const latestReview = submission.reviews?.[0];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{submission.title}</Text>
        <StatusBadge status={submission.status} />
      </View>

      {submission.collabPost && (
        <View style={styles.collabTag}>
          <Feather name="link-2" size={11} color={COLORS.secondary} />
          <Text style={styles.collabTagText}>{submission.collabPost.title}</Text>
        </View>
      )}

      <Text style={styles.cardDesc} numberOfLines={2}>{submission.description}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.proofTypePill}>
          <Feather name="external-link" size={12} color={COLORS.primary} />
          <Text style={styles.proofTypeLabel}>{submission.proofType}</Text>
        </View>
        <Text style={styles.cardDate}>
          {new Date(submission.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>

      {latestReview && (
        <View style={styles.reviewSnippet}>
          <Feather name="message-square" size={13} color={COLORS.text.secondary} />
          <Text style={styles.reviewSnippetText} numberOfLines={1}>
            {latestReview.reviewer.fullName}: "{latestReview.feedback}"
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SubmissionsScreen() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const res = await getMySubmissions();
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchSubmissions(); }, []));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Submissions</Text>
        <TouchableOpacity
          onPress={() => router.push('/(roles)/student/SubmitProjectScreen')}
          style={styles.addBtn}
        >
          <Feather name="plus" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSubmissions(); }} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {submissions.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="upload-cloud" size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Submissions Yet</Text>
            <Text style={styles.emptySubtitle}>Submit your project work to earn verified credentials from alumni reviewers.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(roles)/student/SubmitProjectScreen')}
            >
              <Text style={styles.emptyBtnText}>Submit Your First Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          submissions.map((s) => (
            <SubmissionCard
              key={s.id}
              submission={s}
              onPress={() => router.push({ pathname: '/(roles)/student/SubmissionDetailScreen', params: { submissionId: s.id } })}
            />
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 4 },
  addBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text.primary },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  collabTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  collabTagText: { fontSize: 12, color: COLORS.secondary, fontWeight: '600' },
  cardDesc: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  proofTypePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${COLORS.primary}10`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  proofTypeLabel: { fontSize: 11, color: COLORS.primary, fontWeight: '600', textTransform: 'uppercase' },
  cardDate: { fontSize: 12, color: COLORS.text.secondary },
  reviewSnippet: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: COLORS.border },
  reviewSnippetText: { flex: 1, fontSize: 12, color: COLORS.text.secondary, fontStyle: 'italic' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary, marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: 16, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  emptyBtnText: { color: COLORS.surface, fontWeight: '700', fontSize: 15 },
});
