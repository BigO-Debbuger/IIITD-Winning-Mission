import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { COLORS } from '../../../src/theme/colors';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';

export default function MentorshipSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Mock Requests (Will be fetched from API)
  const [requests, setRequests] = useState([
    { id: '1', studentName: 'Ishita Amin', message: 'I am building an AI Agent in React Native and would love your guidance on architecture.', status: 'pending' },
    { id: '2', studentName: 'Dev Sharma', message: 'Can you review my resume for a backend role at Google?', status: 'pending' },
  ]);

  const handleResponse = (id, response) => {
    // API Call: await api.put(`/mentorship/requests/${id}`, { status: response })
    setRequests(requests.filter(req => req.id !== id));
    alert(`Mentorship ${response}!`);
  };

  const renderRequest = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.studentName.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{item.studentName}</Text>
      </View>
      
      <View style={styles.messageBox}>
        <Text style={styles.message}>"{item.message}"</Text>
      </View>
      
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => handleResponse(item.id, 'rejected')}>
          <Text style={styles.rejectText}>Decline</Text>
        </TouchableOpacity>
        
        <View style={{ flex: 1 }}>
          <PrimaryButton 
            title="Accept Request" 
            onPress={() => handleResponse(item.id, 'accepted')} 
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentorship Requests</Text>
        <View style={{ width: 40 }}/>
      </View>

      <FlatList 
        data={requests}
        keyExtractor={item => item.id}
        renderItem={renderRequest}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={48} color={COLORS.secondary} />
            <Text style={styles.emptyText}>You're all caught up! No pending requests.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  
  listContent: { padding: 20, paddingBottom: 40 },
  
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: COLORS.surface },
  name: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  
  messageBox: { backgroundColor: COLORS.background, padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  message: { fontSize: 14, color: COLORS.text.secondary, fontStyle: 'italic', lineHeight: 22 },
  
  actionRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  rejectBtn: { flex: 1, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  rejectText: { color: COLORS.text.primary, fontWeight: '700', fontSize: 14 },
  
  emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', color: COLORS.text.secondary, marginTop: 16, fontSize: 16, fontWeight: '500' }
});