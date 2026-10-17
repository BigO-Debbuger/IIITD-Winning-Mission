import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Switch, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { COLORS } from "../../../src/theme/colors";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";
import api from "../../../src/services/api";
import { useAuth } from "../../../src/context/AuthContext";

export default function AlumniPostJobScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const COMPANY_NAME = user?.alumniDetails?.company || "Your Company";
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ title: "", skills: "", description: "", requirements: "" });

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs/mine');
      setJobs(res.data);
    } catch (error) {
      console.log("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    try {
      const payload = {
        title: form.title,
        description: form.description,
        requirements: form.skills.split(",").map(s => s.trim()).filter(s => s),
        jobType: "Full-Time", 
        location: "Remote" 
      };
      await api.post('/jobs', payload);
      setModalVisible(false);
      setForm({ title: "", skills: "", description: "", requirements: "" });
      fetchMyJobs(); // Refresh list immediately
    } catch (error) {
      alert("Failed to post job.");
    }
  };

  const renderJobCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="briefcase-variant" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.toggleBox}>
          <Text style={[styles.statusText, { color: COLORS.secondary }]}>ACTIVE</Text>
          <Switch value={true} trackColor={{ true: `${COLORS.secondary}50`, false: COLORS.border }} thumbColor={COLORS.secondary} />
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.company}>{COMPANY_NAME} • {item.jobType}</Text>

      <View style={styles.skillsRow}>
        {item.requirements?.map((s, i) => (
          <View key={i} style={styles.skillTag}><Text style={styles.skillText}>{s}</Text></View>
        ))}
      </View>

      <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* HEADER */}
      <View style={styles.top}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.heading}>Job Management</Text>
        <View style={{width: 40}} />
      </View>

      {/* JOBS LIST */}
      {loading ? (
         <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          renderItem={renderJobCard}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-text-off-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No Active Jobs</Text>
              <Text style={styles.emptyText}>Tap the + button below to create a new job posting for students to apply to.</Text>
            </View>
          }
        />
      )}

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={28} color={COLORS.surface} />
      </TouchableOpacity>

      {/* CREATE JOB MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Job Listing</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Feather name="x" size={24} color={COLORS.text.secondary} /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.companyBox}>
                <Text style={styles.companyLabel}>Posting as Alumni of</Text>
                <Text style={styles.companyName}>{COMPANY_NAME}</Text>
              </View>

              <Text style={styles.label}>Job Title</Text>
              <TextInput placeholder="e.g. Frontend Developer" style={styles.input} value={form.title} onChangeText={t => setForm({ ...form, title: t })} />

              <Text style={styles.label}>Required Skills</Text>
              <TextInput placeholder="e.g. React, Node (Comma separated)" style={styles.input} value={form.skills} onChangeText={t => setForm({ ...form, skills: t })} />

              <Text style={styles.label}>Job Description</Text>
              <TextInput placeholder="Details about the role..." style={[styles.input, { height: 100, textAlignVertical: 'top' }]} multiline value={form.description} onChangeText={t => setForm({ ...form, description: t })} />
            </ScrollView>

            <PrimaryButton title="Publish Job" onPress={handleAddJob} />
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  heading: { fontSize: 20, fontWeight: "800", color: COLORS.primary },
  
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: `${COLORS.primary}15`, justifyContent: 'center', alignItems: 'center' },
  
  title: { fontSize: 18, fontWeight: "800", color: COLORS.text.primary, marginBottom: 4 },
  company: { fontSize: 14, color: COLORS.text.secondary, fontWeight: '600', marginBottom: 16 },
  
  toggleBox: { alignItems: "center" },
  statusText: { fontSize: 10, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
  
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: COLORS.border },
  skillTag: { backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  skillText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  
  desc: { color: COLORS.text.secondary, fontSize: 14, lineHeight: 22 },
  
  fab: { position: "absolute", bottom: 30, right: 20, backgroundColor: COLORS.primary, width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: COLORS.primary },
  
  companyBox: { backgroundColor: `${COLORS.secondary}15`, padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: `${COLORS.secondary}30` },
  companyLabel: { fontSize: 12, color: COLORS.secondary, fontWeight: '700', textTransform: 'uppercase' },
  companyName: { fontSize: 18, fontWeight: "800", color: COLORS.text.primary, marginTop: 4 },
  
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 16, marginBottom: 16, backgroundColor: COLORS.background, fontSize: 15 },

  emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginTop: 16, marginBottom: 8 },
  emptyText: { textAlign: 'center', color: COLORS.text.secondary, lineHeight: 22 }
});