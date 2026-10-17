import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, StyleSheet, FlatList,
  TouchableOpacity, Modal, TextInput, Switch, Alert, ActivityIndicator
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../../src/theme/colors";
import api from "../../../src/services/api";
import ScreenWrapper from "../../../src/components/ui/ScreenWrapper";
import { useAuth } from "../../../src/context/AuthContext";

const POST_TYPES = ["Project", "Hackathon", "Question"];

export default function CollaborationBoard() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("explore"); // 'explore' | 'mine'
  
  const [explorePosts, setExplorePosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Forms
  const [form, setForm] = useState({ type: "Project", title: "", skills: "", description: "" });
  const [applyForm, setApplyForm] = useState({ role: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safety check
  if (!user) return null;

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (activeTab === "explore") {
        const res = await api.get('/collab/active');
        setExplorePosts(res.data);
      } else {
        const res = await api.get('/collab/mine');
        setMyPosts(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* --- API CALLS --- */
  const handleCreatePost = async () => {
    if (!form.title || !form.skills) return Alert.alert("Missing Fields", "Title and Tags/Roles are required.");
    setIsSubmitting(true);
    try {
      await api.post('/collab', {
        type: form.type,
        title: form.title,
        description: form.description,
        roles: form.skills.split(",").map(r => r.trim())
      });
      setShowCreate(false);
      setForm({ type: "Project", title: "", skills: "", description: "" });
      setActiveTab("mine"); 
      fetchPosts();
    } catch (error) {
      Alert.alert("Error", "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitApply = async () => {
    if (selectedPost?.type !== "Question" && !applyForm.role) {
      return Alert.alert("Required", "Please select a specific role.");
    }
    
    setIsSubmitting(true);
    try {
      // If it's a question, default the role to "Helper"
      const appliedRole = selectedPost?.type === "Question" ? "Helper" : applyForm.role;

      await api.post(`/collab/${selectedPost._id}/apply`, {
        role: appliedRole,
        message: applyForm.message
      });
      Alert.alert("Success", "Sent successfully!");
      setShowApply(false);
      setApplyForm({ role: "", message: "" });
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to apply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (postId) => {
    try {
      setMyPosts(prev => prev.map(p => p._id === postId ? { ...p, isActive: !p.isActive } : p));
      await api.put(`/collab/${postId}/toggle`);
    } catch (error) {
      Alert.alert("Error", "Failed to change status");
      fetchPosts(); 
    }
  };

  const openApplyModal = (post) => {
    setSelectedPost(post);
    setApplyForm({ role: "", message: "" });
    setShowApply(true);
  };

  /* --- RENDERERS --- */
  const renderPost = ({ item }) => {
    const isMine = activeTab === "mine";
    const authorName = isMine ? "You" : item.author?.fullName;
    const authorInitial = authorName?.charAt(0) || "U";
    const isQuestion = item.type === "Question";

    return (
      <View style={[styles.postCard, !item.isActive && isMine && { opacity: 0.6 }]}>
        
        {/* HEADER */}
        <View style={styles.postHeader}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{authorInitial}</Text>
            </View>
            <View>
              <Text style={styles.author}>{authorName}</Text>
              <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={[styles.badge, isQuestion && { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.badgeText, isQuestion && { color: '#FF9800' }]}>{item.type}</Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.lookingFor}>{isQuestion ? "Related Topics:" : "Looking for:"}</Text>
        
        <View style={styles.rolesRow}>
          {item.roles.map((role, idx) => (
            <View key={idx} style={styles.roleTag}>
              <Text style={styles.roleText}>{role}</Text>
            </View>
          ))}
        </View>

        {/* BOTTOM ACTIONS */}
        {isMine ? (
          <View style={styles.ownerActions}>
            <View style={styles.toggleRow}>
              <Text style={styles.lookingFor}>{item.isActive ? "Active (Accepting)" : "Inactive (Closed)"}</Text>
              <Switch 
                value={item.isActive} 
                onValueChange={() => toggleStatus(item._id)} 
                trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              />
            </View>
            
            <View style={styles.applicantsBox}>
              <Text style={styles.appTitle}>Responses ({item.applicants?.length || 0})</Text>
              {item.applicants?.map((app, i) => (
                <View key={i} style={styles.appItem}>
                  <Text style={styles.appName}>{app.student?.fullName}</Text>
                  {!isQuestion && <Text style={styles.appRole}>Applied for: {app.role}</Text>}
                  {app.message ? <Text style={styles.appMessage}>"{app.message}"</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.applyBtn, isQuestion && { backgroundColor: '#FFF3E0' }]} 
            onPress={() => openApplyModal(item)}
          >
            <Text style={[styles.applyBtnText, isQuestion && { color: '#FF9800' }]}>
              {isQuestion ? "Offer Help / Answer" : "Apply to Team"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} color={COLORS.text.primary} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Collab Board</Text>
          <TouchableOpacity onPress={() => setShowCreate(true)}><Feather name="plus-circle" size={24} color={COLORS.secondary} /></TouchableOpacity>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, activeTab === 'explore' && styles.tabActive]} onPress={() => setActiveTab('explore')}>
            <Text style={[styles.tabText, activeTab === 'explore' && styles.tabTextActive]}>Explore Teams</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'mine' && styles.tabActive]} onPress={() => setActiveTab('mine')}>
            <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>My Posts</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} /> : (
          <FlatList
            data={activeTab === "explore" ? explorePosts : myPosts}
            keyExtractor={(item) => item._id}
            renderItem={renderPost}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-text-search-outline" size={50} color={COLORS.border} />
                <Text style={styles.emptyText}>No posts found.</Text>
              </View>
            }
          />
        )}

        {/* 📝 CREATE MODAL */}
        <Modal visible={showCreate} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity onPress={() => setShowCreate(false)}>
                  <Feather name="x" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Post Type</Text>
              <View style={styles.typeSelectorRow}>
                {POST_TYPES.map(type => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.typeChip, form.type === type && styles.typeChipActive]}
                    onPress={() => setForm({ ...form, type })}
                  >
                    <Text style={[styles.typeChipText, form.type === type && { color: '#FFF' }]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput placeholder="Title (e.g. Building an AI App)" style={styles.input} value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
              
              <TextInput 
                placeholder={form.type === "Question" ? "Relevant Topics (e.g. React, APIs)" : "Roles Needed (e.g. Frontend, UI/UX)"} 
                style={styles.input} 
                value={form.skills} 
                onChangeText={(t) => setForm({ ...form, skills: t })} 
              />
              
              <TextInput 
                placeholder={form.type === "Question" ? "What do you need help with?" : "Describe your project and goals..."} 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                multiline 
                value={form.description} 
                onChangeText={(t) => setForm({ ...form, description: t })} 
              />

              <TouchableOpacity style={styles.postBtn} onPress={handleCreatePost} disabled={isSubmitting}>
                <Text style={styles.postText}>{isSubmitting ? "Posting..." : "Publish Post"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 🙋‍♂️ APPLY MODAL */}
        <Modal visible={showApply} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>{selectedPost?.type === "Question" ? "Offer Help" : "Apply to Team"}</Text>
                <TouchableOpacity onPress={() => setShowApply(false)}>
                  <Feather name="x" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={{ marginBottom: 16, color: COLORS.text.secondary }}>
                {selectedPost?.type === "Question" ? `Answering: ${selectedPost?.title}` : `Applying to: ${selectedPost?.title}`}
              </Text>

              {/* Strict Role Selection for Projects/Hackathons */}
              {selectedPost?.type !== "Question" && (
                <>
                  <Text style={styles.label}>Select a Role:</Text>
                  <View style={styles.typeSelectorRow}>
                    {selectedPost?.roles.map(role => (
                      <TouchableOpacity 
                        key={role} 
                        style={[styles.typeChip, applyForm.role === role && styles.typeChipActive]}
                        onPress={() => setApplyForm({ ...applyForm, role })}
                      >
                        <Text style={[styles.typeChipText, applyForm.role === role && { color: '#FFF' }]}>{role}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.label}>Message</Text>
              <TextInput 
                placeholder={selectedPost?.type === "Question" ? "How can you help?" : "Why are you a good fit for this role?"} 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                multiline 
                value={applyForm.message} 
                onChangeText={(t) => setApplyForm({ ...applyForm, message: t })} 
              />

              <TouchableOpacity style={styles.postBtn} onPress={submitApply} disabled={isSubmitting}>
                <Text style={styles.postText}>{isSubmitting ? "Sending..." : "Send Message"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 40, backgroundColor: COLORS.surface },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text.primary },
  
  tabs: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: COLORS.primary },
  tabText: { color: COLORS.text.secondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: '800' },

  listContainer: { padding: 16, paddingBottom: 40 },
  postCard: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, marginBottom: 16, elevation: 1, borderWidth: 1, borderColor: COLORS.border },
  postHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  authorRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: `${COLORS.primary}15`, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  author: { fontWeight: "700", color: COLORS.text.primary },
  time: { fontSize: 12, color: COLORS.text.secondary },
  badge: { backgroundColor: "#E7F0FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: "#2B75FF", fontSize: 11, fontWeight: "700" },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  desc: { color: COLORS.text.secondary, fontSize: 13, marginBottom: 10, lineHeight: 20 },
  lookingFor: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
  rolesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  roleTag: { borderWidth: 1, borderColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  roleText: { color: COLORS.secondary, fontSize: 12, fontWeight: '600' },
  
  applyBtn: { backgroundColor: `${COLORS.primary}10`, padding: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  applyBtnText: { fontWeight: "700", color: COLORS.primary },

  ownerActions: { marginTop: 10, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 10 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  applicantsBox: { backgroundColor: COLORS.background, padding: 10, borderRadius: 10 },
  appTitle: { fontWeight: '700', fontSize: 13, color: COLORS.primary, marginBottom: 8 },
  appItem: { backgroundColor: COLORS.surface, padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  appName: { fontWeight: '700', fontSize: 13 },
  appRole: { fontSize: 12, color: COLORS.text.secondary },
  appMessage: { fontSize: 12, fontStyle: 'italic', color: COLORS.text.secondary, marginTop: 4 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: COLORS.text.secondary, marginTop: 10 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: COLORS.surface, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: COLORS.primary },
  
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: COLORS.text.primary },
  typeSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { color: COLORS.text.secondary, fontWeight: '600' },

  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, marginBottom: 16, backgroundColor: COLORS.background },
  postBtn: { backgroundColor: COLORS.secondary, padding: 14, borderRadius: 12, alignItems: "center", marginTop: 4 },
  postText: { color: "#fff", fontWeight: "700", fontSize: 16 }
});