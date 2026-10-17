import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../../src/theme/colors";
import { useAuth } from "../../../src/context/AuthContext";
import api from "../../../src/services/api";

export default function AlumniDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth(); 

  const [liveUser, setLiveUser] = useState(user);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user) return null;

  const isComplete = liveUser?.isProfileComplete;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const profileRes = await api.get('/users/profile');
      const freshData = profileRes.data;
      setLiveUser(freshData);

      if (freshData.isProfileComplete) {
        const mentorRes = await api.get('/mentorship/requests');
        setPendingRequests(mentorRes.data.filter(req => req.status === 'pending'));

        const appRes = await api.get('/jobs/alumni-applicants');
        // ✂️ ONLY SHOW TOP 2 APPLICANTS ON DASHBOARD
        setApplicants(appRes.data.slice(0, 2)); 
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMentorshipStatus = async (id, status) => {
    try {
      await api.put(`/mentorship/requests/${id}`, { status });
      Alert.alert("Success", `Request ${status}!`);
      setPendingRequests(prev => prev.filter(req => req._id !== id));
    } catch (error) {
      Alert.alert("Error", "Could not update request");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.greet}>Welcome back 👋</Text>
          <Text style={styles.name}>{user?.fullName || "Alumni"}</Text>
        </View>

        {/* PROFILE GUARD */}
        {!loading && liveUser && !isComplete && (
          <View style={styles.guardCardInline}>
            <View style={styles.guardIconBoxInline}>
              <Feather name="shield" size={32} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.guardTitleInline}>Complete Setup</Text>
              <Text style={styles.guardSubInline}>Finish your professional profile to mentor students and post jobs.</Text>
              <TouchableOpacity style={styles.guardBtnInline} onPress={() => router.push('/(roles)/alumni/EditAlumniProfile')}>
                <Text style={styles.guardBtnTextInline}>Setup Career Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* HORIZONTAL MENTORSHIP REQUESTS (UPGRADED UI) */}
        {isComplete && pendingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Mentorship Requests</Text>
              <TouchableOpacity onPress={() => router.push('/(roles)/alumni/MentorshipSessionScreen')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingBottom: 15, paddingLeft: 2 }}>
              {pendingRequests.map(req => (
                <View key={req._id} style={styles.mentorCard}>
                  <View style={styles.mentorHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{req.student?.fullName?.charAt(0)}</Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.reqName}>{req.student?.fullName}</Text>
                      <Text style={styles.reqCourse} numberOfLines={1}>{req.student?.studentDetails?.course || 'Student'}</Text>
                    </View>
                  </View>
                  <View style={styles.messageContainer}>
                    <Text style={styles.reqMessage} numberOfLines={2}>"{req.message}"</Text>
                  </View>
                  <View style={styles.reqActions}>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleMentorshipStatus(req._id, 'rejected')}>
                      <Text style={styles.rejectText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleMentorshipStatus(req._id, 'accepted')}>
                      <Text style={styles.btnText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            
            {/* POST JOB: Opens form instantly */}
            <TouchableOpacity style={[styles.card, !isComplete && styles.disabledCard]} disabled={!isComplete} onPress={() => router.push('/(roles)/alumni/PostJobScreen')}>
              <View style={[styles.iconBox, { backgroundColor: isComplete ? `${COLORS.secondary}15` : COLORS.border }]}><Feather name="edit" size={24} color={isComplete ? COLORS.secondary : COLORS.text.secondary} /></View>
              <Text style={styles.cardTitle}>Post Job</Text>
              <Text style={styles.cardSub}>Create new listing</Text>
            </TouchableOpacity>

            {/* AI MATCHES: Routes to new AI scouting hub */}
            <TouchableOpacity style={[styles.card, !isComplete && styles.disabledCard]} disabled={!isComplete} onPress={() => router.push('/(roles)/alumni/AlumniAIMatchesScreen')}>
              <View style={[styles.iconBox, { backgroundColor: isComplete ? `${COLORS.primary}15` : COLORS.border }]}><MaterialCommunityIcons name="robot-outline" size={26} color={isComplete ? COLORS.primary : COLORS.text.secondary} /></View>
              <Text style={styles.cardTitle}>AI Matches</Text>
              <Text style={styles.cardSub}>Scout top talent</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DIRECT APPLICANTS */}
        {isComplete && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Direct Applicants</Text>
              <TouchableOpacity onPress={() => router.push('/(roles)/alumni/AlumniApplicantsScreen')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {loading ? <ActivityIndicator color={COLORS.primary} /> : applicants.length === 0 ? (
              <Text style={styles.helperText}>No recent applicants to your job postings.</Text>
            ) : (
              applicants.map(app => (
                <View key={app._id} style={styles.matchCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqName}>{app.student?.fullName}</Text>
                    <Text style={styles.reqText}>Applied to: <Text style={{fontWeight: '700', color: COLORS.primary}}>{app.job?.title}</Text></Text>
                  </View>
                  <TouchableOpacity style={styles.viewAppBtn} onPress={() => router.push(`/(roles)/alumni/ViewStudentProfileScreen?studentId=${app.student._id}`)}>
                    <Text style={styles.btnText}>Review</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginTop: 10, marginBottom: 24 },
  greet: { color: COLORS.text.secondary, fontSize: 14, marginBottom: 4 },
  name: { fontSize: 28, fontWeight: '800', color: COLORS.primary, letterSpacing: -0.5 },

  guardCardInline: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 20, borderRadius: 20, borderWidth: 2, borderColor: COLORS.primary, marginBottom: 24, alignItems: 'center' },
  guardIconBoxInline: { width: 60, height: 60, borderRadius: 30, backgroundColor: `${COLORS.primary}10`, justifyContent: 'center', alignItems: 'center' },
  guardTitleInline: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  guardSubInline: { fontSize: 13, color: COLORS.text.secondary, marginBottom: 12 },
  guardBtnInline: { alignSelf: 'flex-start', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  guardBtnTextInline: { color: COLORS.surface, fontSize: 13, fontWeight: '700' },

  section: { marginBottom: 32 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  viewAllText: { color: COLORS.secondary, fontWeight: '700', fontSize: 14 },

  // SLEEK RECTANGULAR MENTOR CARD
  mentorCard: { 
    width: 290, 
    backgroundColor: COLORS.surface, 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  mentorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  reqCourse: { fontSize: 13, color: COLORS.text.secondary, marginTop: 2 },
  messageContainer: { backgroundColor: COLORS.background, padding: 12, borderRadius: 10, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  reqMessage: { fontSize: 13, color: COLORS.text.secondary, fontStyle: 'italic', lineHeight: 18 },
  reqActions: { flexDirection: 'row', gap: 10 },

  grid: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  disabledCard: { opacity: 0.6 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontWeight: '700', fontSize: 15, color: COLORS.text.primary },
  cardSub: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },

  matchCard: { backgroundColor: COLORS.surface, padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  reqName: { fontWeight: '800', fontSize: 16, color: COLORS.text.primary },
  reqText: { color: COLORS.text.secondary, fontSize: 13, marginTop: 4 },

  acceptBtn: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  rejectBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  viewAppBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: COLORS.surface, fontWeight: '700', fontSize: 13 },
  rejectText: { color: COLORS.text.primary, fontWeight: '700', fontSize: 13 },
  helperText: { color: COLORS.text.secondary, fontStyle: 'italic' }
});