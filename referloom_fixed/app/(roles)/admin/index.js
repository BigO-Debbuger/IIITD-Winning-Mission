import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { COLORS } from '../../../src/theme/colors';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';
import { useAuth } from '../../../src/context/AuthContext';

export default function AdminDashboardScreen() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'verified'

  // Mock Data for Verification Queue
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', role: 'Student', email: 'john@college.edu', status: 'pending' },
    { id: '2', name: 'TechCorp Inc.', role: 'Company', email: 'hr@techcorp.com', status: 'pending' },
  ]);

  const handleVerify = (id) => {
    // API Call: await api.post(`/admin/verify/${id}`)
    setUsers(users.filter(u => u.id !== id));
    alert('User Verified Successfully');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userDetail}>{item.role} • {item.email}</Text>
      </View>
      <TouchableOpacity style={styles.verifyBtn} onPress={() => handleVerify(item.id)}>
        <Feather name="check" size={20} color={COLORS.surface} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={logout}>
          <Feather name="log-out" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]} 
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Pending Verification</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'verified' && styles.tabActive]} 
          onPress={() => setActiveTab('verified')}
        >
          <Text style={[styles.tabText, activeTab === 'verified' && styles.tabTextActive]}>System Health</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList 
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No pending verifications.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  tabActive: { borderColor: COLORS.secondary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.text.secondary },
  tabTextActive: { color: COLORS.secondary },
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cardInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  userDetail: { fontSize: 13, color: COLORS.text.secondary },
  verifyBtn: { backgroundColor: COLORS.success, width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: COLORS.text.secondary, marginTop: 40 }
});