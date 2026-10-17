import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../src/theme/colors';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';

const TABS = ['applied', 'interviewing', 'offered', 'rejected'];

export default function JobApplicantsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('applied');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApplicants(); }, []);

  const fetchApplicants = async () => {
    try {
      const response = await api.get('/jobs/company/applicants');
      setApplicants(response.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/jobs/company/applications/${appId}/status`, { status: newStatus });
      setApplicants(prev => prev.map(app => app._id === appId ? { ...app, status: newStatus } : app));
      Alert.alert("Pipeline Updated", `Candidate moved to ${newStatus.toUpperCase()}`);
    } catch (error) { Alert.alert("Error", "Failed to update status"); }
  };

  const filteredApps = applicants.filter(app => app.status === activeTab);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/(roles)/company/ViewStudentProfileScreen', params: { studentId: item.student?._id } })}
    >
      <View style={styles.cardHeader}>
        {/* ✅ FIX: Added flex: 1 and paddingRight to prevent text from pushing the score badge out */}
        <View style={{ flex: 1, paddingRight: 12 }}>
          {/* ✅ FIX: Added numberOfLines={1} to prevent multi-line wrapping glitches */}
          <Text style={styles.name} numberOfLines={1}>{item.student?.fullName}</Text>
          <Text style={styles.jobTitle} numberOfLines={1}>Applied for: {item.job?.title}</Text>
        </View>
        
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{item.fitScore}% Match</Text>
        </View>
      </View>

      <Text style={styles.headline} numberOfLines={1}>
        {item.student?.headline || item.student?.studentDetails?.course || 'Student'}
      </Text>

      {/* Action Buttons based on Pipeline Stage */}
      <View style={styles.actions}>
        {activeTab === 'applied' && (
          <>
            <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => updateStatus(item._id, 'interviewing')}>
              <Feather name="calendar" size={16} color="#FFF" /><Text style={styles.btnTextWhite}> Invite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => updateStatus(item._id, 'rejected')}>
              <Feather name="x" size={16} color="#FFF" /><Text style={styles.btnTextWhite}> Reject</Text>
            </TouchableOpacity>
          </>
        )}
        {activeTab === 'interviewing' && (
          <>
            <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => updateStatus(item._id, 'offered')}>
              <Feather name="award" size={16} color="#FFF" /><Text style={styles.btnTextWhite}> Send Offer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => updateStatus(item._id, 'rejected')}>
              <Text style={styles.btnTextWhite}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} color={COLORS.text.primary} /></TouchableOpacity>
          <Text style={styles.headerTitle}>ATS Pipeline</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} /> : (
          <FlatList
            data={filteredApps}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: 'gray', marginTop: 50 }}>No candidates in this stage.</Text>}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 40, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  activeTabText: { color: COLORS.primary, fontWeight: '800' },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.primary },
  jobTitle: { fontSize: 13, color: COLORS.primary, marginTop: 2, fontWeight: '600' },
  scoreBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  scoreText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
  headline: { color: COLORS.text.secondary, fontSize: 13, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, flexDirection: 'row', paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  acceptBtn: { backgroundColor: COLORS.primary },
  rejectBtn: { backgroundColor: '#E53935' },
  btnTextWhite: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});