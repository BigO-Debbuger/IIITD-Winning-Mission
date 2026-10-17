// wavesync_fixed/app/(roles)/student/SubmitProjectScreen.js
// Build-to-Earn: submission creation form for students.

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../src/theme/colors';
import { createSubmission } from '../../../src/services/submission.service';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';

const PROOF_TYPES = [
  { label: 'GitHub Repository', value: 'github', icon: 'github' },
  { label: 'Live / Demo URL', value: 'live', icon: 'globe' },
  { label: 'PDF Document', value: 'pdf', icon: 'file-text' },
  { label: 'Other', value: 'other', icon: 'link' },
];

export default function SubmitProjectScreen() {
  const router = useRouter();
  const { collabPostId, collabTitle } = useLocalSearchParams();

  const [form, setForm] = useState({
    title: '',
    description: '',
    proofUrl: '',
    proofType: 'github',
    collabPostId: collabPostId || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 3) e.title = 'Title must be at least 3 characters.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.proofUrl.trim()) {
      e.proofUrl = 'A proof URL is required.';
    } else {
      try {
        const url = new URL(form.proofUrl.trim());
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          e.proofUrl = 'URL must start with https:// or http://';
        }
      } catch {
        e.proofUrl = 'Please enter a valid URL.';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        proofUrl: form.proofUrl.trim(),
        proofType: form.proofType,
      };
      if (form.collabPostId) payload.collabPostId = form.collabPostId;

      await createSubmission(payload);
      Alert.alert(
        '✅ Submitted!',
        'Your proof-of-work submission is now pending review.',
        [{ text: 'View My Submissions', onPress: () => router.replace('/(roles)/student/SubmissionsScreen') }]
      );
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit. Please try again.';
      Alert.alert('Submission Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Work</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Context badge if coming from a collab post */}
          {collabTitle ? (
            <View style={styles.contextBadge}>
              <Feather name="link-2" size={14} color={COLORS.secondary} />
              <Text style={styles.contextText}>Linked to: {collabTitle}</Text>
            </View>
          ) : null}

          <Text style={styles.intro}>
            Share your proof of work. All submissions are reviewed by verified alumni.
            Approved submissions earn a signed credential.
          </Text>

          {/* Title */}
          <Text style={styles.label}>Project Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="e.g. WaveSync AI Matching Engine"
            placeholderTextColor="#aaa"
            value={form.title}
            onChangeText={(v) => setForm({ ...form, title: v })}
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

          {/* Description */}
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textarea, errors.description && styles.inputError]}
            placeholder="What did you build? What problem does it solve? What stack did you use?"
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={5}
            value={form.description}
            onChangeText={(v) => setForm({ ...form, description: v })}
          />
          {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

          {/* Proof Type */}
          <Text style={styles.label}>Proof Type *</Text>
          <View style={styles.proofTypeRow}>
            {PROOF_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt.value}
                style={[styles.proofTypeBtn, form.proofType === pt.value && styles.proofTypeBtnActive]}
                onPress={() => setForm({ ...form, proofType: pt.value })}
              >
                <Feather
                  name={pt.icon}
                  size={16}
                  color={form.proofType === pt.value ? COLORS.surface : COLORS.text.secondary}
                />
                <Text style={[styles.proofTypeText, form.proofType === pt.value && styles.proofTypeTextActive]}>
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Proof URL */}
          <Text style={styles.label}>Evidence URL *</Text>
          <TextInput
            style={[styles.input, errors.proofUrl && styles.inputError]}
            placeholder="https://github.com/you/repo"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            keyboardType="url"
            value={form.proofUrl}
            onChangeText={(v) => setForm({ ...form, proofUrl: v })}
          />
          {errors.proofUrl ? <Text style={styles.errorText}>{errors.proofUrl}</Text> : null}

          <View style={styles.noteBox}>
            <Feather name="shield" size={14} color={COLORS.secondary} />
            <Text style={styles.noteText}>
              Only https:// URLs are accepted. Your submission will be reviewed and
              cryptographically signed by a verified alumni reviewer.
            </Text>
          </View>

          <PrimaryButton
            title={submitting ? 'Submitting…' : 'Submit for Review'}
            onPress={handleSubmit}
            isLoading={submitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text.primary },
  body: { padding: 20, paddingBottom: 40 },
  contextBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${COLORS.secondary}18`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 },
  contextText: { fontSize: 13, color: COLORS.secondary, fontWeight: '600' },
  intro: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 20, marginBottom: 24, backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text.primary },
  inputError: { borderColor: COLORS.error },
  textarea: { height: 120, textAlignVertical: 'top' },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4, marginLeft: 4 },
  proofTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  proofTypeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  proofTypeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  proofTypeText: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '600' },
  proofTypeTextActive: { color: COLORS.surface },
  noteBox: { flexDirection: 'row', gap: 8, backgroundColor: `${COLORS.secondary}12`, borderRadius: 10, padding: 14, marginTop: 20, alignItems: 'flex-start' },
  noteText: { flex: 1, fontSize: 13, color: COLORS.text.secondary, lineHeight: 18 },
  submitBtn: { marginTop: 28 },
});
