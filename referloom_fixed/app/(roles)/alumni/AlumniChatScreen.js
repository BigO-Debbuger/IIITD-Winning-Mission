import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Modal 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import api from '../../../src/services/api';
import { COLORS } from '../../../src/theme/colors';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';

export default function AlumniChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Version 2 Modal States
  const [showV2Modal, setShowV2Modal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchAcceptedRequests();
  }, []);

  const fetchAcceptedRequests = async () => {
    try {
      const response = await api.get('/mentorship/requests');
      // 🧠 Only keep requests where status === 'accepted'
      const accepted = response.data.filter(req => req.status === 'accepted');
      setAcceptedStudents(accepted);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (student) => {
    setSelectedStudent(student);
    setShowV2Modal(true);
  };

  const renderStudentCard = ({ item }) => {
    const student = item.student || {};
    return (
      <TouchableOpacity 
        style={styles.chatCard} 
        activeOpacity={0.7} 
        onPress={() => handleOpenChat(student)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.fullName?.charAt(0) || 'S'}</Text>
        </View>
        
        <View style={styles.chatInfo}>
          <Text style={styles.studentName}>{student.fullName || 'Unknown Student'}</Text>
          <Text style={styles.studentCourse}>{student.studentDetails?.course || 'Student'}</Text>
          <Text style={styles.previewText} numberOfLines={1}>Tap to start mentoring...</Text>
        </View>

        <View style={styles.chatIconBox}>
          <Feather name="message-circle" size={20} color={COLORS.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Mentees</Text>
          <View style={{ width: 40 }}/>
        </View>

        {/* LIST OF ACCEPTED STUDENTS */}
        <FlatList
          data={acceptedStudents}
          keyExtractor={item => item._id}
          renderItem={renderStudentCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <MaterialCommunityIcons name="message-text-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Active Chats</Text>
              <Text style={styles.emptyText}>
                When you accept a mentorship request from the dashboard, the student will appear here for direct messaging.
              </Text>
            </View>
          }
        />

        {/* 🚀 VERSION 2 TEASER MODAL */}
        <Modal visible={showV2Modal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.v2IconBox}>
                <MaterialCommunityIcons name="rocket-launch" size={40} color="#FFF" />
              </View>
              <Text style={styles.modalTitle}>Chat is coming soon!</Text>
              <Text style={styles.modalText}>
                Direct messaging with <Text style={{fontWeight: '800', color: COLORS.text.primary}}>{selectedStudent?.fullName?.split(' ')[0]}</Text> will be available in <Text style={{fontWeight: '800', color: COLORS.primary}}>ReferLoom V2.0</Text> 🚀
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowV2Modal(false)}>
                <Text style={styles.closeBtnText}>Got it, I'll wait!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  
  listContent: { padding: 20, paddingBottom: 40 },
  
  chatCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: `${COLORS.primary}15`, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  
  chatInfo: { flex: 1 },
  studentName: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary, marginBottom: 2 },
  studentCourse: { fontSize: 13, color: COLORS.text.secondary, marginBottom: 4 },
  previewText: { fontSize: 13, color: COLORS.primary, fontStyle: 'italic' },
  
  chatIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${COLORS.primary}10`, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

  // EMPTY STATE
  emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${COLORS.primary}10`, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginBottom: 8 },
  emptyText: { textAlign: 'center', color: COLORS.text.secondary, fontSize: 14, lineHeight: 22 },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 5 },
  v2IconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: -60, borderWidth: 4, borderColor: '#fff' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary, marginBottom: 12 },
  modalText: { fontSize: 15, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  closeBtn: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});