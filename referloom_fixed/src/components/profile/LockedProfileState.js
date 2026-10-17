// referloom_frontend/src/components/profile/LockedProfileState.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

export default function LockedProfileState({ basicProfile, onSendRequest }) {
  return (
    <View style={styles.container}>
      {/* Basic Info Allowed by Privacy Engine */}
      <View style={styles.basicInfoCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{basicProfile.fullName.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{basicProfile.fullName}</Text>
        <Text style={styles.course}>{basicProfile.student?.course} • Sem {basicProfile.student?.semester}</Text>
      </View>

      {/* The Lock Graphic */}
      <View style={styles.lockContainer}>
        <Feather name="lock" size={48} color={COLORS.text?.secondary || '#666'} />
        <Text style={styles.lockTitle}>Profile is Private</Text>
        <Text style={styles.lockDesc}>
          Students can only view basic profiles of their peers. Send a collaboration request to connect and view projects.
        </Text>
      </View>

      <TouchableOpacity style={styles.requestBtn} onPress={onSendRequest}>
        <Feather name="user-plus" size={20} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.requestBtnText}>Send Collab Request</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: COLORS.background || '#F8F9FA' },
  basicInfoCard: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary || '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40, color: '#FFF', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.text?.primary || '#1A1A1A' },
  course: { fontSize: 16, color: COLORS.text?.secondary || '#666', marginTop: 4 },
  lockContainer: { alignItems: 'center', backgroundColor: COLORS.surface || '#FFF', padding: 30, borderRadius: 16, width: '100%', elevation: 1 },
  lockTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  lockDesc: { textAlign: 'center', color: COLORS.text?.secondary || '#666', lineHeight: 22 },
  requestBtn: { flexDirection: 'row', backgroundColor: COLORS.primary || '#007AFF', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, marginTop: 40, width: '100%', justifyContent: 'center', alignItems: 'center' },
  requestBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});