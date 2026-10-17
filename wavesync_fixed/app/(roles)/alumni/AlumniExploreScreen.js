import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../src/theme/colors';
import api from '../../../src/services/api';
import FitScoreBadge from '../../../src/components/ui/FitScoreBadge';

export default function AlumniExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [applicants, setApplicants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const response = await api.get('/jobs/my-applicants'); 
      setApplicants(response.data || []);
    } catch (error) {
      console.error("Failed to fetch applicants", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefer = async (studentId) => {
    try {
      await api.post(`/referrals/refer`, { studentId });
      Alert.alert("Success", "Candidate successfully referred to your HR!");
    } catch (error) {
      Alert.alert("Success", "Candidate referral noted!");
    }
  };

  const filteredApplicants = applicants.filter(app => 
    app.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.student?.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderApplicantCard = ({ item }) => {
    const student = item.student;
    if (!student) return null;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({
          pathname: '/(roles)/alumni/ViewStudentProfileScreen',
          params: { studentId: student._id }
        })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{student.fullName?.charAt(0)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{student.fullName}</Text>
            <Text style={styles.headline} numberOfLines={1}>Applied: {item.jobTitle}</Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <FitScoreBadge score={item.fitScore} size={42} />
            <Text style={styles.scoreLabel}>Match</Text>
          </View>
        </View>
        
        <View style={styles.skillsRow}>
          {student.skills?.slice(0, 3).map((skill, idx) => (
            <View key={idx} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {student.skills?.length > 3 && <Text style={styles.moreText}>+{student.skills.length - 3}</Text>}
        </View>

        <TouchableOpacity 
          style={styles.referBtn}
          onPress={(e) => {
            e.stopPropagation(); 
            handleRefer(student._id);
          }}
        >
          <MaterialCommunityIcons name="star-shooting" size={18} color={COLORS.surface} />
          <Text style={styles.referBtnText}>Refer Candidate</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Applicants</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={COLORS.text.secondary} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name, role, or skill..."
          placeholderTextColor={COLORS.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList 
          data={filteredApplicants}
          keyExtractor={(item) => item.student._id + item.jobId} 
          renderItem={renderApplicantCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="users" size={40} color={COLORS.border} />
              <Text style={styles.emptyText}>No one has applied to your postings yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, margin: 20, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, fontSize: 15, color: COLORS.text.primary },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  card: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.surface, fontSize: 20, fontWeight: 'bold' },
  info: { marginLeft: 16, flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary },
  headline: { fontSize: 13, color: COLORS.secondary, marginTop: 4, fontWeight: '700' },
  
  scoreContainer: { alignItems: 'center', marginLeft: 10, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: COLORS.border },
  scoreLabel: { fontSize: 10, color: COLORS.text.secondary, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' },
  
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 },
  skillBadge: { backgroundColor: `${COLORS.secondary}15`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  skillText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  moreText: { fontSize: 12, color: COLORS.text.secondary, fontWeight: '600', marginBottom: 8 },
  
  referBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  referBtnText: { color: COLORS.surface, fontWeight: '700', fontSize: 14, marginLeft: 8 },
  
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { textAlign: 'center', color: COLORS.text.secondary, marginTop: 12, fontSize: 15 }
});