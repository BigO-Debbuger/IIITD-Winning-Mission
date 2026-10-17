// wavesync_fixed/app/(roles)/student/SubmissionDetailScreen.js
// Build-to-Earn: Submission detail view with evidence link and review history.

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { COLORS } from '../../../src/theme/colors';
import { getSubmissionById, getReviewsForSubmission } from '../../../src/services/submission.service';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';

const STATUS_CONFIG = {
  pending:   { label: 'Pending Review', color: '#F59E0B', bg: '#FEF3C7', icon: 'clock' },
  in_review: { label: 'In Review',      color: '#3B82F6', bg: '#EFF6FF', icon: 'eye' },
  approved:  { label: 'Approved',       color: '#10B981', bg: '#D1FAE5', icon: 'check-circle' },
  rejected:  { label: 'Rejected',       color: '#EF4444', bg: '#FEE2E2', icon: 'x-circle' },
};

const VERDICT_CONFIG = {
  approved:        { label: 'Approved',        color: '#10B981', icon: 'check-circle' },
  rejected:        { label: 'Rejected',        color: '#EF4444', icon: 'x-circle' },
  needs_revision:  { label: 'Needs Revision',  color: '#F59E0B', icon: 'edit-2' },
};

function ReviewCard({ review }) {
  const vcfg = VERDICT_CONFIG[review.verdict] || VERDICT_CONFIG.needs_revision;
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitial}>
              {review.reviewer.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>{review.reviewer.fullName}</Text>
            <Text style={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>
        <View style={[styles.verdictBadge, { backgroundColor: `${vcfg.color}15` }]}>
          <Feather name={vcfg.icon} size={13} color={vcfg.color} />
          <Text style={[styles.verdictLabel, { color: vcfg.color }]}>{vcfg.label}</Text>
        </View>
      </View>

      <Text style={styles.feedbackText}>{review.feedback}</Text>

      {/* Signature integrity indicator */}
      {review.signatureIntact !== null && review.signatureIntact !== undefined && (
        <View style={[styles.sigRow, { backgroundColor: review.signatureIntact ? '#D1FAE5' : '#FEE2E2' }]}>
          <Feather
            name={review.signatureIntact ? 'shield' : 'alert-triangle'}
            size={12}
            color={review.signatureIntact ? '#10B981' : '#EF4444'}
          />
          <Text style={[styles.sigText, { color: review.signatureIntact ? '#10B981' : '#EF4444' }]}>
            {review.signatureIntact ? 'Signature verified — review is tamper-proof' : 'Signature mismatch — review may have been modified'}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function SubmissionDetailScreen() {
  const router = useRouter();
  const { submissionId } = useLocalSearchParams();
  const [submission, setSubmission] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [subRes, revRes] = await Promise.all([
        getSubmissionById(submissionId),
        getReviewsForSubmission(submissionId),
      ]);
      setSubmission(subRes.data);
      setReviews(revRes.data.reviews || []);
    } catch (err) {
      console.error('Failed to load submission', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [submissionId]));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!submission) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorMsg}>Submission not found.</Text>
      </View>
    );
  }

  const scfg = STATUS_CONFIG[submission.status] || STATUS_CONFIG.pending;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{submission.title}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
      >
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: scfg.bg, borderColor: scfg.color + '44' }]}>
          <Feather name={scfg.icon} size={18} color={scfg.color} />
          <Text style={[styles.statusLabel, { color: scfg.color }]}>{scfg.label}</Text>
        </View>

        {/* Collab link */}
        {submission.collabPost && (
          <View style={styles.collabBadge}>
            <Feather name="link-2" size={13} color={COLORS.secondary} />
            <Text style={styles.collabBadgeText}>Linked to: {submission.collabPost.title}</Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.descText}>{submission.description}</Text>
        </View>

        {/* Evidence */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Evidence</Text>
          <TouchableOpacity
            style={styles.proofBtn}
            onPress={() => Linking.openURL(submission.proofUrl)}
          >
            <Feather name="external-link" size={16} color={COLORS.primary} />
            <Text style={styles.proofBtnText} numberOfLines={1}>{submission.proofUrl}</Text>
          </TouchableOpacity>
          <Text style={styles.proofType}>Type: {submission.proofType}</Text>
        </View>

        {/* Review history */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Reviews ({reviews.length})
          </Text>
          {reviews.length === 0 ? (
            <View style={styles.noReviews}>
              <Feather name="clock" size={24} color={COLORS.border} />
              <Text style={styles.noReviewsText}>
                {submission.status === 'pending'
                  ? 'Awaiting an alumni reviewer…'
                  : 'No reviews yet.'}
              </Text>
            </View>
          ) : (
            reviews.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  errorMsg: { color: COLORS.error, fontSize: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.text.primary, marginHorizontal: 8 },
  body: { padding: 16, paddingBottom: 40 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1 },
  statusLabel: { fontSize: 15, fontWeight: '700' },
  collabBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${COLORS.secondary}15`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16, alignSelf: 'flex-start' },
  collabBadgeText: { fontSize: 12, color: COLORS.secondary, fontWeight: '600' },
  section: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  descText: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 20 },
  proofBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${COLORS.primary}10`, borderRadius: 10, padding: 12 },
  proofBtnText: { flex: 1, fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  proofType: { marginTop: 8, fontSize: 12, color: COLORS.text.secondary, textTransform: 'capitalize' },
  noReviews: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  noReviewsText: { fontSize: 14, color: COLORS.text.secondary },
  reviewCard: { borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, backgroundColor: COLORS.background },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  reviewerInitial: { color: COLORS.surface, fontWeight: '700', fontSize: 15 },
  reviewerName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  reviewDate: { fontSize: 11, color: COLORS.text.secondary, marginTop: 1 },
  verdictBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  verdictLabel: { fontSize: 11, fontWeight: '700' },
  feedbackText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 18 },
  sigRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, borderRadius: 8, padding: 8 },
  sigText: { flex: 1, fontSize: 11, fontWeight: '600' },
});
