import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  ScrollView, Modal, ActivityIndicator, RefreshControl 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";
import api from '../../../src/services/api';
import { COLORS } from "../../../src/theme/colors";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";

export default function AlumniProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, isLoading: authLoading } = useAuth();
  
  // 1. ALL HOOKS
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 2. LOGOUT SAFETY CHECK (Must be after hooks, before calculations)
  if (!user) return null;

  // 3. THE FIX: Check fetched DB profile first, fallback to cached user
  const isComplete = profile ? profile.isProfileComplete : user?.isProfileComplete;

  const fetchFullProfile = async () => {
    try {
      const targetId = user?.id || user?._id; 
      const response = await api.get(`/users/${targetId}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Profile fetch error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user?.id || user?._id) fetchFullProfile();
      else setLoading(false);
    }
  }, [user, authLoading]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFullProfile();
  }, [user]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  // Derive Display Variables
  const name = profile?.fullName || "Alumni";
  const role = profile?.alumniDetails?.jobRole || "Professional";
  const company = profile?.alumniDetails?.company || "Company";
  const gradYear = profile?.alumniDetails?.graduationYear || "Graduate";
  const skills = profile?.alumniDetails?.skills || ["Product Strategy", "Leadership", "Mentoring"];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alumni Profile</Text>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.menuBtn}>
          <Feather name="more-vertical" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* OVERLAY MENU */}
      <Modal visible={menuOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { top: insets.top + 50 }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/(roles)/alumni/EditAlumniProfile'); }}>
              <Feather name="edit-2" size={18} color={COLORS.primary} />
              <Text style={styles.menuText}>Edit Profile</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); logout(); }}>
              <Feather name="log-out" size={18} color={COLORS.error} />
              <Text style={[styles.menuText, { color: COLORS.error }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >

        {/* PROFILE CARD - Always visible using registration info */}
        <View style={styles.card}>
          <Image source={{ uri: profile?.profileImage || "https://i.pravatar.cc/150?img=11" }} style={styles.avatar} />
          
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {isComplete && <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} style={{marginLeft: 6}} />}
          </View>

          <Text style={styles.role}>{role} @ {company}</Text>
          <Text style={styles.gradYear}>Class of {gradYear}</Text>

          {isComplete && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Open for Mentorship</Text>
            </View>
          )}
        </View>

        {/* CONDITIONAL RENDERING BASED ON PROFILE COMPLETION */}
        {!isComplete ? (

          /* 🚨 PROFILE GUARD ACTION CARD */
          <View style={styles.actionRequiredCard}>
            <View style={styles.actionIconBox}>
              <Feather name="user-check" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>Profile Setup Required</Text>
            <Text style={styles.actionSub}>
              Complete your profile details to unlock mentorship tools, post jobs, and connect with top students.
            </Text>
            <PrimaryButton 
              title="    Complete Profile    " 
              onPress={() => router.push('/(roles)/alumni/EditAlumniProfile')} 
            />
          </View>

        ) : (
          
          /* ✅ SHOW REST ONLY IF COMPLETE */
          <>
            {/* STATS */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="account-group" size={20} color={COLORS.primary} />
                <Text style={styles.statNum}>25</Text>
                <Text style={styles.statLabel}>Mentored</Text>
              </View>
              <View style={styles.statBox}>
                <Feather name="briefcase" size={20} color={COLORS.primary} />
                <Text style={styles.statNum}>4</Text>
                <Text style={styles.statLabel}>Jobs Posted</Text>
              </View>
              <View style={styles.statBox}>
                <Feather name="check-circle" size={20} color={COLORS.primary} />
                <Text style={styles.statNum}>12</Text>
                <Text style={styles.statLabel}>Referrals</Text>
              </View>
            </View>

            {/* QUICK ACTIONS */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(roles)/alumni/MentorshipSessionScreen')}>
                <MaterialCommunityIcons name="account-voice" size={18} color={COLORS.surface} />
                <Text style={styles.primaryText}>Manage Mentorship</Text>
              </TouchableOpacity>
            </View>

            {/* SKILLS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expertise</Text>
              <View style={styles.skillRow}>
                {skills.map((s, i) => (
                  <View key={i} style={styles.skillTag}>
                    <Text style={styles.skillText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>

        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 22, fontWeight: "800", color: COLORS.primary },
  menuBtn: { padding: 4 },

  card: { alignItems: "center", padding: 24, borderRadius: 24, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, elevation: 1 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, borderWidth: 3, borderColor: `${COLORS.secondary}40` },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: "800", color: COLORS.text.primary },
  role: { fontSize: 15, fontWeight: "600", color: COLORS.text.secondary, marginTop: 4 },
  gradYear: { fontSize: 13, color: COLORS.text.secondary, marginTop: 2 },
  badge: { marginTop: 16, backgroundColor: `${COLORS.secondary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  badgeText: { fontSize: 12, color: COLORS.secondary, fontWeight: "700" },

  // 🚨 Action Required Card Styles
  actionRequiredCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  actionIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${COLORS.primary}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  actionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 8, textAlign: 'center' },
  actionSub: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, gap: 10 },
  statBox: { flex: 1, alignItems: "center", backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  statNum: { fontSize: 20, fontWeight: "800", color: COLORS.text.primary, marginTop: 8 },
  statLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },

  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  primaryBtn: { flex: 1, flexDirection: "row", backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, justifyContent: "center", alignItems: 'center', gap: 8 },
  primaryText: { color: COLORS.surface, fontWeight: "700", fontSize: 15 },

  section: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12, color: COLORS.primary },
  skillRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  skillTag: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  skillText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  menu: { position: "absolute", right: 20, backgroundColor: COLORS.surface, borderRadius: 12, width: 160, elevation: 5, shadowOpacity: 0.1, borderWidth: 1, borderColor: COLORS.border },
  menuItem: { flexDirection: "row", padding: 16, gap: 12, alignItems: "center" },
  menuText: { fontSize: 14, fontWeight: "600", color: COLORS.text.primary },
  menuDivider: { height: 1, backgroundColor: COLORS.border }
});