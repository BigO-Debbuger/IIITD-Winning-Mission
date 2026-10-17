import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../src/theme/colors';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';
import api from '../../../src/services/api';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';
import { useAuth } from '../../../src/context/AuthContext';

export default function MentorshipRequestScreen() {
  const router = useRouter();
  const { alumniId, alumniName, company } = useLocalSearchParams();
  const { user } = useAuth(); // ✅ FIX: Added useAuth

  const isComposeMode = !!alumniId;

  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(!isComposeMode);

  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const mentorshipReasons = [
    "Resume Review",
    "Mock Interview",
    "Career Guidance",
    "Skill Growth",
    "Referral Help"
  ];

  // ✅ FIX: Safety check for logout
  if (!user) return null;

  useEffect(() => {
    if (!isComposeMode) fetchRequests();
  }, [isComposeMode]);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/mentorship/requests');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!reason) return Alert.alert("Select reason");
    if (!message.trim()) return Alert.alert("Write message");

    setSending(true);
    try {
      await api.post('/mentorship/request', {
        alumniId,
        message: `[${reason}] ${message}`
      });

      Alert.alert("Sent 🚀", "Mentorship request sent!");
      router.replace('/(roles)/student/MentorshipRequestScreen');

    } catch (e) {
      Alert.alert("Error", "Failed to send");
    } finally {
      setSending(false);
    }
  };

  /* ================= COMPOSE SCREEN ================= */

  if (isComposeMode) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="x" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Request Mentor</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.content}>

            {/* TARGET */}
            <View style={styles.targetCard}>
              <Text style={styles.targetLabel}>MENTOR</Text>
              <Text style={styles.targetName}>{alumniName}</Text>
              <Text style={styles.targetCompany}>{company}</Text>
            </View>

            {/* REASON */}
            <Text style={styles.label}>Why do you need help?</Text>
            <View style={styles.reasonWrap}>
              {mentorshipReasons.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[styles.reasonChip, reason === item && styles.reasonActive]}
                  onPress={() => setReason(item)}
                >
                  <Text style={[styles.reasonText, reason === item && styles.reasonTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* MESSAGE */}
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Write a short message..."
              multiline
              value={message}
              onChangeText={setMessage}
            />

          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <PrimaryButton
              title="Send Request"
              onPress={handleSendRequest}
              isLoading={sending}
            />
          </View>

        </View>
      </ScreenWrapper>
    );
  }

  /* ================= HUB SCREEN ================= */

  const filtered = requests.filter(r => r.status === activeTab);

  return (
    <ScreenWrapper>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mentorship Hub</Text>
          <TouchableOpacity onPress={() => router.push('/(roles)/student/StudentExploreScreen')}>
            <Feather name="search" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Find a Mentor 🚀</Text>
          <Text style={styles.ctaSub}>Connect with alumni & HR</Text>

          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/(roles)/student/StudentExploreScreen')}
          >
            <Text style={styles.ctaBtnText}>Explore Mentors</Text>
          </TouchableOpacity>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {['pending', 'accepted'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'pending' ? 'Pending' : 'My Mentors'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
        ) : (
          <ScrollView style={{ padding: 20 }}>
            {filtered.length > 0 ? filtered.map(req => (
              <View key={req._id} style={styles.card}>

                <View style={styles.cardTop}>
                  <Text style={styles.name}>{req.alumni?.fullName}</Text>
                  <View style={[
                    styles.badge,
                    { backgroundColor: req.status === 'accepted' ? '#E8F5E9' : '#FFF3E0' }
                  ]}>
                    <Text style={{
                      color: req.status === 'accepted' ? '#4CAF50' : '#FF9800',
                      fontSize: 11, fontWeight: '700'
                    }}>
                      {req.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* ✅ FIXED MAPPING: Pulling from alumniDetails instead of professionalDetails */}
                <Text style={styles.company}>
                  {req.alumni?.alumniDetails?.role} @ {req.alumni?.alumniDetails?.company || 'Verified Alumni'}
                </Text>

                {req.status === 'accepted' && (
                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() => router.push({
                      pathname: '/(roles)/student/StudentChatScreen'
                    })}
                  >
                    <Text style={styles.chatText}>Open Chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            )) : (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="account-search" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No {activeTab} requests</Text>

                {activeTab === 'pending' && (
                  <TouchableOpacity onPress={() => router.push('/(roles)/student/StudentExploreScreen')}>
                    <Text style={styles.link}>Find a Mentor</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        )}

      </View>
    </ScreenWrapper>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff'
  },

  headerTitle: { fontSize: 18, fontWeight: '800' },

  content: { padding: 20 },

  targetCard: {
    backgroundColor: '#EEF4FF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20
  },

  targetLabel: { fontSize: 10, color: COLORS.primary },
  targetName: { fontSize: 20, fontWeight: '800' },
  targetCompany: { color: '#666' },

  label: { fontWeight: '700', marginBottom: 8 },

  reasonWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  reasonChip: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },

  reasonActive: { backgroundColor: COLORS.primary },

  reasonText: { fontSize: 13 },
  reasonTextActive: { color: '#fff' },

  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    height: 120
  },

  footer: { padding: 20 },

  /* HUB */

  cta: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#EEF4FF'
  },

  ctaTitle: { fontWeight: '800', fontSize: 16 },
  ctaSub: { color: '#666', marginVertical: 6 },

  ctaBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center'
  },

  ctaBtnText: { color: '#fff', fontWeight: '700' },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee' },

  tab: { flex: 1, padding: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: COLORS.primary },

  tabText: { color: '#888' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  name: { fontWeight: '700' },
  company: { color: '#666', marginTop: 4 },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },

  chatBtn: {
    backgroundColor: COLORS.primary,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },

  chatText: { color: '#fff', fontWeight: '700' },

  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 10, color: '#888' },
  link: { color: COLORS.primary, marginTop: 10 }
});