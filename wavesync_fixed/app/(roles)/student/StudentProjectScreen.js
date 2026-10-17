import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Linking, Image, Modal, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../src/theme/colors';
import api from '../../../src/services/api';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';
import PrimaryButton from '../../../src/components/ui/PrimaryButton';

export default function StudentProjectScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({ 
    title: '', description: '', tags: '', github: '', live: '' 
  });

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error("Failed to load project details", error);
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  // Pre-fill form when opening the edit modal
  const handleOpenEdit = () => {
    setEditForm({
      title: project.title || '',
      description: project.description || '',
      tags: project.technologies?.join(', ') || project.tags?.join(', ') || '',
      github: project.github || project.link || '',
      live: project.live || ''
    });
    setIsEditing(true);
  };

  // Submit the update to the backend
  const handleUpdateProject = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        github: editForm.github,
        live: editForm.live,
        // Send as array
        tags: editForm.tags.split(',').map(t => t.trim()),
        technologies: editForm.tags.split(',').map(t => t.trim()) 
      };

      await api.put(`/projects/${projectId}`, payload);
      
      // Refresh the page data
      await fetchProject();
      setIsEditing(false);
      Alert.alert("Success", "Project updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      Alert.alert("Error", "Could not update the project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !project) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  const dateUploaded = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  });

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <TouchableOpacity onPress={handleOpenEdit}>
            <Feather name="edit-3" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* PROJECT IMAGE / THUMBNAIL */}
          {project.image ? (
            <Image source={{ uri: project.image }} style={styles.projectImage} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <MaterialCommunityIcons name="application-braces-outline" size={60} color={COLORS.primary} />
            </View>
          )}

          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.date}>Uploaded {dateUploaded}</Text>

          {/* QUICK LINKS */}
          {(project.github || project.live) && (
            <View style={styles.actionRow}>
              {project.github && (
                <TouchableOpacity style={styles.githubBtn} onPress={() => openLink(project.github)}>
                  <Feather name="github" size={18} color="#FFF" />
                  <Text style={styles.linkTextWhite}>Code</Text>
                </TouchableOpacity>
              )}

              {project.live && (
                <TouchableOpacity style={styles.liveBtn} onPress={() => openLink(project.live)}>
                  <Feather name="external-link" size={18} color={COLORS.primary} />
                  <Text style={styles.linkTextPrimary}>Live</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ABOUT */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>About Project</Text>
            <Text style={styles.description}>
              {project.description || "No description provided."}
            </Text>
          </View>

          {/* TECH STACK */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Tech Stack</Text>
            <View style={styles.tagsContainer}>
              {(project.technologies?.length > 0 || project.tags?.length > 0) ? (
                (project.technologies || project.tags).map((tech, index) => (
                  <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tech}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.placeholderText}>No technologies listed.</Text>
              )}
            </View>
          </View>
          

          {/* RAW LINKS */}
          {(project.github || project.live || project.link) && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Project Links</Text>
              <View style={{ marginTop: 6 }}>
                {project.github && (
                  <Text style={styles.linkUrl} onPress={() => openLink(project.github)}>
                    🔗 {project.github}
                  </Text>
                )}
                {project.live && (
                  <Text style={styles.linkUrl} onPress={() => openLink(project.live)}>
                    🌐 {project.live}
                  </Text>
                )}
                {project.link && (
                  <Text style={styles.linkUrl} onPress={() => openLink(project.link)}>
                    🔗 {project.link}
                  </Text>
                )}
              </View>
            </View>
          )}

        </ScrollView>

        {/* 📝 EDIT MODAL */}
        <Modal visible={isEditing} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Project</Text>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Feather name="x" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalForm}>
                  <Text style={styles.inputLabel}>Project Title</Text>
                  <TextInput style={styles.modalInput} placeholder="Title" value={editForm.title} onChangeText={t => setEditForm({...editForm, title: t})} />
                  
                  <Text style={styles.inputLabel}>Technologies / Tags (comma separated)</Text>
                  <TextInput style={styles.modalInput} placeholder="React, Node.js, MongoDB" value={editForm.tags} onChangeText={t => setEditForm({...editForm, tags: t})} />
                  
                  <Text style={styles.inputLabel}>GitHub URL</Text>
                  <TextInput style={styles.modalInput} placeholder="https://github.com/..." autoCapitalize="none" value={editForm.github} onChangeText={t => setEditForm({...editForm, github: t})} />

                  <Text style={styles.inputLabel}>Live / Demo URL</Text>
                  <TextInput style={styles.modalInput} placeholder="https://myapp.com" autoCapitalize="none" value={editForm.live} onChangeText={t => setEditForm({...editForm, live: t})} />

                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput style={[styles.modalInput, {height: 100}]} multiline placeholder="What did you build?" value={editForm.description} onChangeText={t => setEditForm({...editForm, description: t})} />
                </View>
              </ScrollView>

              <PrimaryButton title="Update Project" onPress={handleUpdateProject} isLoading={isSubmitting} />
            </KeyboardAvoidingView>
          </View>
        </Modal>

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary },
  content: { padding: 20 },
  
  thumbnailPlaceholder: { width: '100%', height: 180, backgroundColor: '#F0F4F8', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#D9E2EC' },
  projectImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 24 },
  
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text.primary },
  date: { fontSize: 14, color: COLORS.text.secondary, marginTop: 6 },
  
  actionRow: { flexDirection: 'row', marginTop: 24, gap: 12, paddingBottom: 24, borderBottomWidth: 1, borderColor: COLORS.border },
  githubBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#24292E', paddingVertical: 14, borderRadius: 12 },
  liveBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: `${COLORS.primary}15`, paddingVertical: 14, borderRadius: 12 },
  linkTextWhite: { color: '#FFF', fontWeight: '700', marginLeft: 8 },
  linkTextPrimary: { color: COLORS.primary, fontWeight: '700', marginLeft: 8 },
  
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, marginTop: 20, borderWidth: 1, borderColor: COLORS.border },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', marginBottom: 10 },
  description: { fontSize: 15, color: COLORS.text.secondary, lineHeight: 24 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagBadge: { backgroundColor: COLORS.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  tagText: { color: COLORS.text.primary, fontWeight: '600', fontSize: 13 },
  
  placeholderText: { fontSize: 14, color: COLORS.text.secondary, fontStyle: 'italic' },
  linkUrl: { fontSize: 14, color: COLORS.primary, marginTop: 10, fontWeight: '500' },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  modalForm: { gap: 4, paddingBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary, marginBottom: 6, marginLeft: 4 },
  modalInput: { backgroundColor: COLORS.background, borderRadius: 12, padding: 16, fontSize: 15, color: COLORS.text.primary, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, textAlignVertical: 'top' },
});