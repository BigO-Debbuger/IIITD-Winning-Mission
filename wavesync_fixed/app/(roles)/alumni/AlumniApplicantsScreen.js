import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { COLORS } from "../../../src/theme/colors";
import api from "../../../src/services/api";
import ScreenWrapper from "../../../src/components/ui/ScreenWrapper";
import FitScoreBadge from "../../../src/components/ui/FitScoreBadge";

export default function AlumniApplicantsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const res = await api.get('/jobs/alumni-applicants');
      setApplicants(res.data);
    } catch (error) {
      console.error("Failed to fetch applicants", error);
    } finally {
      setLoading(false);
    }
  };

  const renderApplicantCard = ({ item }) => {
    const student = item.student;
    if (!student) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            {student.profileImage ? (
              <Image source={{ uri: student.profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{student.fullName?.charAt(0) || 'S'}</Text>
            )}
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.studentName}>{student.fullName}</Text>
            <Text style={styles.appliedJobText}>
              Applied to: <Text style={{fontWeight: '700', color: COLORS.primary}}>{item.job?.title}</Text>
            </Text>
          </View>
          
          {/* Show fit score if generated during application */}
          {item.fitScore ? <FitScoreBadge score={item.fitScore} size={45} /> : null}
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.reviewBtn}
          onPress={() => router.push(`/(roles)/alumni/ViewStudentProfileScreen?studentId=${student._id}`)}
        >
          <Text style={styles.reviewBtnText}>Review Profile & Resume</Text>
          <Feather name="chevron-right" size={18} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inbound Applicants</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
        ) : (
          <FlatList
            data={applicants}
            keyExtractor={(item) => item._id}
            renderItem={renderApplicantCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={60} color={COLORS.border} />
                <Text style={styles.emptyTitle}>No Applicants Yet</Text>
                <Text style={styles.emptyText}>When students apply directly to your posted jobs, their applications will appear here.</Text>
              </View>
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  
  listContent: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: `${COLORS.primary}15`, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 25 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  studentName: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginBottom: 2 },
  appliedJobText: { fontSize: 13, color: COLORS.text.secondary },
  
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 16, borderTopWidth: 1, borderColor: COLORS.border },
  statusBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  dateText: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '500' },

  reviewBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, gap: 6 },
  reviewBtnText: { color: COLORS.surface, fontWeight: '700', fontSize: 15 },

  emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginTop: 16, marginBottom: 8 },
  emptyText: { textAlign: 'center', color: COLORS.text.secondary, lineHeight: 22 }
});