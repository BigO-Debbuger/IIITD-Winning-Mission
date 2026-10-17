import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import ScreenWrapper from "../../../src/components/ui/ScreenWrapper";
import FitScoreBadge from "../../../src/components/ui/FitScoreBadge";
import { COLORS } from "../../../src/theme/colors";
import api from "../../../src/services/api";

export default function JobMatchesScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) fetchMatches();
  }, [jobId]);

  const fetchMatches = async () => {
    try {
      // Calls the new AI route we built
      const res = await api.get(`/jobs/${jobId}/matches`);
      setMatches(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefer = async (studentId) => {
    try {
      await api.post(`/referrals/refer`, { studentId, jobId });
      alert("Candidate referred successfully 🚀");
    } catch (err) {
      alert("Failed to refer candidate. They may already be referred.");
    }
  };

  const renderStudent = ({ item }) => {
    const student = item.student;
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{student.fullName}</Text>
            <View style={styles.skillsRow}>
              {student.studentDetails?.skills?.slice(0, 4).map((s, i) => (
                <View key={i} style={styles.skillTag}>
                  <Text style={styles.skillText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
          <FitScoreBadge score={item.fitScore} size={55} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push({ pathname: '/(roles)/alumni/ViewStudentProfileScreen', params: { studentId: student._id } })}
          >
            <Feather name="user" size={14} color={COLORS.text.primary} />
            <Text style={styles.secondaryText}> View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => handleRefer(student._id)}>
            <Text style={styles.primaryText}>Refer Candidate</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.top}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} /></TouchableOpacity>
          <Text style={styles.title}>AI Candidate Matches</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.student._id}
            renderItem={renderStudent}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 50}}>No strong matches found for this job yet.</Text>}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 50, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 18, fontWeight: "700" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text.primary },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  skillTag: { backgroundColor: "#E3F2FD", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6, marginBottom: 6 },
  skillText: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  primaryBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.border, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  secondaryText: { fontWeight: "600", color: COLORS.text.primary },
  center: { flex: 1, justifyContent: "center", alignItems: "center" }
});