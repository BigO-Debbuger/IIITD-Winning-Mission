import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, ScrollView,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import api from '../../../src/services/api';
import FitScoreBadge from '../../../src/components/ui/FitScoreBadge';
import { COLORS } from '../../../src/theme/colors';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';

export default function JobMatchScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [activeSort, setActiveSort] = useState('High Match'); 
  const [activeFilter, setActiveFilter] = useState('All'); 
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await api.get('/jobs/matches');
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...jobs];
    
    // 1. Search filter
    if (search) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.companyName.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 2. Job Type filter (🔥 FIXED to use soft matching)
    if (activeFilter !== 'All') {
      const filterTerm = activeFilter.toLowerCase() === 'full-time' ? 'full-time' : 'intern';
      result = result.filter(job => 
        job.jobType && job.jobType.toLowerCase().includes(filterTerm)
      );
    }

    // 3. Sorting
    if (activeSort === 'Recent') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      result.sort((a, b) => b.fitScore - a.fitScore);
    }
    
    setFilteredJobs(result);
  }, [search, activeFilter, activeSort, jobs]);

  const renderJobCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/(roles)/student/JobDetailScreen',
          params: { jobId: item._id }
        })
      }
    >
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.company} numberOfLines={1}>
            {item.companyName} • {item.location}
          </Text>
          <View style={styles.typeBadge}>
            <Feather name="briefcase" size={12} color={COLORS.primary} />
            <Text style={styles.typeText}>{item.jobType}</Text>
          </View>
        </View>
        <View style={styles.scoreBox}>
          <FitScoreBadge score={item.fitScore} size={55} />
          <Text style={styles.scoreText}>AI Match</Text>
        </View>
      </View>
      <View style={styles.tagsWrap}>
        {item.requirements?.slice(0, 4).map((skill, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{skill}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.viewBtn}>
        <Text style={styles.viewBtnText}>View Details →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>

        {/* HEADER - Updated with Notification and tighter spacing */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerTitle}>AI Job Matches 🤖</Text>
              <Text style={styles.sub}>Based on your profile & skills</Text>
            </View>

            <TouchableOpacity onPress={() => router.push('/(roles)/student/notification')}>
                <View style={styles.avatar}>
                  <Feather name="bell" size={20} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather name="search" size={18} color="#888" />
              <TextInput
                placeholder="Search roles or companies"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity 
              style={styles.filterIconBtn} 
              onPress={() => setFilterModalVisible(true)}
            >
              <Feather name="sliders" size={22} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item._id}
          renderItem={renderJobCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No matches found 😕</Text>
              <Text style={styles.emptySub}>Try adjusting your search or filters.</Text>
            </View>
          }
        />

        <Modal 
          visible={isFilterModalVisible} 
          animationType="slide" 
          transparent={true}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sort & Filter</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Feather name="x" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSectionTitle}>Sort By</Text>
              <View style={styles.modalChipRow}>
                {['High Match', 'Recent'].map((opt) => (
                  <TouchableOpacity 
                    key={opt}
                    style={[styles.modalChip, activeSort === opt ? styles.modalChipActive : styles.modalChipInactive]}
                    onPress={() => setActiveSort(opt)}
                  >
                    <Text style={{ color: activeSort === opt ? '#FFF' : COLORS.text.secondary, fontWeight: '600' }}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalSectionTitle}>Job Type</Text>
              <View style={styles.modalChipRow}>
                {['All', 'Full-Time', 'Internship'].map((opt) => (
                  <TouchableOpacity 
                    key={opt}
                    style={[styles.modalChip, activeFilter === opt ? styles.modalChipActive : styles.modalChipInactive]}
                    onPress={() => setActiveFilter(opt)}
                  >
                    <Text style={{ color: activeFilter === opt ? '#FFF' : COLORS.text.secondary, fontWeight: '600' }}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity 
                style={styles.applyBtn} 
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyBtnText}>Show Results</Text>
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

  /* HEADER */
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.border
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary
  },

  sub: {
    color: COLORS.text.secondary,
    fontSize: 13
  },

  notificationBtn: {
    position: 'relative',
    padding: 4
  },

  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    borderWidth: 1.5,
    borderColor: '#fff'
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    paddingVertical: 10
  },

  filterIconBtn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary
  },

  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 10,
    marginBottom: 12
  },

  modalChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },

  modalChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1
  },

  modalChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },

  modalChipInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border
  },

  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },

  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },

  /* CARD */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text.primary
  },

  company: {
    color: COLORS.text.secondary,
    marginTop: 4
  },

  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start'
  },

  typeText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600'
  },

  scoreBox: {
    alignItems: 'center'
  },

  scoreText: {
    fontSize: 11,
    marginTop: 4,
    color: '#666'
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 6
  },

  tag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },

  tagText: {
    fontSize: 12,
    color: COLORS.text.secondary
  },

  viewBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary + '10',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center'
  },

  viewBtnText: {
    color: COLORS.primary,
    fontWeight: '700'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2
  },

  empty: {
    alignItems: 'center',
    marginTop: 60
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700'
  },

  emptySub: {
    color: '#888',
    marginTop: 6,
    textAlign: 'center'
  }
});