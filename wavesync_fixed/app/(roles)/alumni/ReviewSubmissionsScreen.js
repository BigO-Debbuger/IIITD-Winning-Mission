// wavesync_fixed/app/(roles)/alumni/ReviewSubmissionsScreen.js
// Build-to-Earn: Alumni reviewer interface — queue, review form, history.

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Alert, RefreshControl,
  Linking, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS } from '../../../src/theme/colors';
import {
  getPendingSubmissions,
  getReviewsForSubmission,
  createReview,
} from '../../../src/services/submission.service';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';

const VERDICT_OPTIONS = [
  { value: 'approved',       label: 'Approve',         icon: 'check-circle', color: '#10B981' },
  { value: 'needs_revision', label: 'Request Revision', icon: 'edit-2',       color: '#F59E0B' },
  { value: 'rejected',       label: 'Reject',           icon: 'x-circle',    color: '#EF4444' },
];

function QueueCard({ submission, onReview }) {
  const reviewCount = submission.reviews?.length || 0;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardMeta}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {submission.author.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{submission.author.fullName}</Text>
            <Text style={styles.submittedDate}>
              {new Date(submission.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
        <View style={styles.statusDot} />
      </View>

      <Text style={styles.cardTitle}>{submission.title}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>{submission.description}</Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.viewEvidenceBtn}
          onPress={() => Linking.openURL(submission.proofUrl)}
        >
          <Feather name="external-link" size={14} color={COLORS.primary} />
          <Text style={styles.viewEvidenceTxt}>View Evidence</Text>
        </TouchableOpacity>

        {reviewCount === 0 ? (
          <TouchableOpacity style={styles.reviewBtn} onPress={() => onReview(submission)}>
            <Feather name="edit-3" size={14} color={COLORS.surface} />
            <Text style={styles.reviewBtnTxt}>Review</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.reviewedBadge}>
            <Feather name="check" size={12} color="#10B981" />
            <Text style={styles.reviewedText}>Reviewed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ReviewSubmissionsScreen() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Review modal state
  const [reviewTarget, setReviewTarget] = useState(null);
  const [verdict, setVerdict] = useState('approved');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await getPendingSubmissions();
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to load review queue', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchQueue(); }, []));

  const openReviewModal = (submission) => {
    setReviewTarget(submission);
    setVerdict('approved');
    setFeedback('');
  };

  const handleSubmitReview = async () => {
    if (!feedback.trim() || feedback.trim().length < 10) {
      Alert.alert('Feedback Required', 'Please provide at least 10 characters of constructive feedback.');
      return;
    }
    setSubmitting(true);
    try {
      await createReview({
        submissionId: reviewTarget.id,
        verdict,
        feedback: feedback.trim(),
      });
      setReviewTarget(null);
      setFeedback('');
      Alert.alert(
        '✅ Review Submitted',
        `Your review has been recorded${verdict === 'approved' ? ' and cryptographically signed' : ''}.`,
        [{ text: 'OK', onPress: fetchQueue }]
      );
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit review.';
      Alert.alert('Review Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Review Queue</Text>
          <Text style={styles.headerSub}>{submissions.length} pending</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchQueue(); }} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {submissions.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Queue is Clear</Text>
            <Text style={styles.emptySubtitle}>No submissions are currently pending review.</Text>
          </View>
        ) : (
          submissions.map((s) => (
            <QueueCard key={s.id} submission={s} onReview={openReviewModal} />
          ))
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={!!reviewTarget} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Review</Text>
              <TouchableOpacity onPress={() => setReviewTarget(null)}>
                <Feather name="x" size={22} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            {reviewTarget && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSubtitle} numberOfLines={1}>{reviewTarget.title}</Text>

                <TouchableOpacity
                  style={styles.evidenceLink}
                  onPress={() => Linking.openURL(reviewTarget.proofUrl)}
                >
                  <Feather name="external-link" size={14} color={COLORS.primary} />
                  <Text style={styles.evidenceLinkText} numberOfLines={1}>{reviewTarget.proofUrl}</Text>
                </TouchableOpacity>

                {/* Verdict selector */}
                <Text style={styles.fieldLabel}>Verdict *</Text>
                <View style={styles.verdictRow}>
                  {VERDICT_OPTIONS.map((v) => (
                    <TouchableOpacity
                      key={v.value}
                      style={[styles.verdictBtn, verdict === v.value && { backgroundColor: v.color, borderColor: v.color }]}
                      onPress={() => setVerdict(v.value)}
                    >
                      <Feather name={v.icon} size={15} color={verdict === v.value ? '#fff' : v.color} />
                      <Text style={[styles.verdictBtnText, verdict === v.value && { color: '#fff' }]}>{v.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Feedback */}
                <Text style={styles.fieldLabel}>Feedback * (min. 10 characters)</Text>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Provide specific, actionable feedback about this submission…"
                  placeholderTextColor="#aaa"
                  multiline
                  numberOfLines={5}
                  value={feedback}
                  onChangeText={setFeedback}
                />

                {verdict === 'approved' && (
                  <View style={styles.sigNote}>
                    <Feather name="shield" size={13} color={COLORS.secondary} />
                    <Text style={styles.sigNoteText}>
                      Your review will be cryptographically signed with Ed25519 and recorded on WaveSync.
                      This signature verifies you authored this review and cannot be forged.
                    </Text>
                  </View>
                )}

                <PrimaryButton
                  title={submitting ? 'Submitting…' : 'Submit Review'}
                  onPress={handleSubmitReview}
                  isLoading={submitting}
                  style={{ marginTop: 16, marginBottom: 32 }}
                />
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text.primary, textAlign: 'center' },
  headerSub: { fontSize: 12, color: COLORS.text.secondary, textAlign: 'center' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  authorInitial: { color: '#fff', fontWeight: '700', fontSize: 15 },
  authorName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  submittedDate: { fontSize: 11, color: COLORS.text.secondary },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F59E0B' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 18, marginBottom: 12 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  viewEvidenceBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${COLORS.primary}10`, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  viewEvidenceTxt: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  reviewBtnTxt: { fontSize: 13, color: '#fff', fontWeight: '700' },
  reviewedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: '#D1FAE5' },
  reviewedText: { fontSize: 12, color: '#10B981', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary, marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  modalSubtitle: { fontSize: 14, color: COLORS.text.secondary, marginBottom: 10 },
  evidenceLink: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${COLORS.primary}10`, borderRadius: 10, padding: 10, marginBottom: 16 },
  evidenceLinkText: { flex: 1, fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary, marginBottom: 8, marginTop: 12 },
  verdictRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  verdictBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  verdictBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary },
  feedbackInput: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 14, color: COLORS.text.primary, height: 120, textAlignVertical: 'top', marginTop: 4 },
  sigNote: { flexDirection: 'row', gap: 8, backgroundColor: `${COLORS.secondary}12`, borderRadius: 10, padding: 12, marginTop: 12, alignItems: 'flex-start' },
  sigNoteText: { flex: 1, fontSize: 12, color: COLORS.text.secondary, lineHeight: 17 },
});
