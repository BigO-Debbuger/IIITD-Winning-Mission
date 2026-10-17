import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, LayoutAnimation, UIManager, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { COLORS } from '../../../src/theme/colors';
import api from '../../../src/services/api';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';

// 🔥 Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function StudentDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [liveUser, setLiveUser] = useState(user);
  const [topMatches, setTopMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for AI Profile Engine
  const [profileStrength, setProfileStrength] = useState(0);
  const [nextStep, setNextStep] = useState("Loading AI insights...");

  if (!user) return null;

  const isComplete = liveUser?.isProfileComplete;

  // 1. Fetch fresh data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchFreshProfile();
    }, [])
  );

  // 2. Animate and update if the global user context changes
  useEffect(() => {
    if (user && user.profileStrength !== undefined && user.profileStrength !== profileStrength) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Trigger animation
      setProfileStrength(user.profileStrength);
      setNextStep(user.profileSuggestions?.[0] || "Your profile is perfectly optimized for your goals! 🔥");
    }
  }, [user]);

  const fetchFreshProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const freshData = response.data;
      setLiveUser(freshData);

      if (freshData.isProfileComplete) {
        fetchTopMatch();
      }

      // Trigger animation before setting the new state
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      if (freshData.profileStrength !== undefined) {
        setProfileStrength(freshData.profileStrength);
        setNextStep(freshData.profileSuggestions?.[0] || "Your profile is perfectly optimized for your goals! 🔥");
      } else {
        setProfileStrength(30);
        setNextStep("Set your Career Goals to unlock AI profile scoring.");
      }

    } catch (err) {
      console.log("Error fetching fresh profile on dashboard:", err);
      setNextStep("Could not load AI insights.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopMatch = async () => {
    try {
      const res = await api.get('/jobs/matches');
      const highMatches = res.data.filter(job => job.fitScore >= 80);
      const best = highMatches.sort((a, b) => b.fitScore - a.fitScore).slice(0, 3);
      setTopMatches(best);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScreenWrapper>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                Hello, {user?.fullName?.split(' ')[0]} 👋
              </Text>
              <Text style={styles.subtext}>Let’s build your career today</Text>
            </View>

            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => router.push('/(roles)/student/notification')}>
                <View style={styles.avatar}>
                  <Feather name="bell" size={20} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* UNLOCK AI WARNING */}
          {!loading && liveUser && !isComplete && (
            <View style={styles.guardCardInline}>
              <View style={styles.guardIconBoxInline}>
                <Feather name="shield" size={32} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.guardTitleInline}>Unlock AI Matches</Text>
                <Text style={styles.guardSubInline}>Complete your career profile to see jobs tailored for you.</Text>
                <TouchableOpacity 
                  style={styles.guardBtnInline}
                  onPress={() => router.push('/(roles)/student/EditProfile')}
                >
                  <Text style={styles.guardBtnTextInline}>Complete Profile</Text>
                  <Feather name="arrow-right" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* 🧠 DYNAMIC AI PROFILE STRENGTH */}
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: profileStrength >= 80 ? '#10B981' : profileStrength >= 50 ? '#F59E0B' : '#EF4444' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionLabel}>AI Profile Strength</Text>
              <Text style={[styles.progressText, { color: profileStrength >= 80 ? '#10B981' : profileStrength >= 50 ? '#F59E0B' : '#EF4444' }]}>
                {profileStrength}%
              </Text>
            </View>
            
            <View style={styles.progressBarBg}>
              {/* 🔥 Standard View. LayoutAnimation automatically animates this width change! */}
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${profileStrength}%`,
                    backgroundColor: profileStrength >= 80 ? '#10B981' : profileStrength >= 50 ? '#F59E0B' : '#EF4444'
                  }
                ]} 
              />
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 10, gap: 8 }}>
              <Feather name="zap" size={16} color={COLORS.secondary} style={{ marginTop: 2 }} />
              <Text style={styles.helperText}>{nextStep}</Text>
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard 
              icon="target" 
              title="Set Career Goals" 
              disabled={!isComplete}
              onPress={() => isComplete && router.push('/(roles)/student/CareerSetupScreen')} 
            />
            <ActionCard 
              icon="users" 
              title="Find Mentor" 
              disabled={!isComplete}
              onPress={() => isComplete && router.push('/(roles)/student/MentorshipRequestScreen')} 
            />
            <ActionCard 
              icon="briefcase" 
              title="Job Matches" 
              disabled={!isComplete}
              onPress={() => isComplete && router.push('/(roles)/student/JobMatchScreen')} 
            />
            <ActionCard 
              icon="message-circle" 
              title="Collab Board" 
              disabled={!isComplete}
              onPress={() => isComplete && router.push('/(roles)/student/CollaborationBoard')} 
            />
          </View>

          {/* AI JOB MATCHES */}
          <Text style={styles.sectionLabel}>Top Matches For You</Text>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : !isComplete ? (
            <View style={[styles.card, { opacity: 0.6 }]}>
              <Text style={styles.helperText}>Complete profile setup to see your top AI matches.</Text>
            </View>
          ) : topMatches.length > 0 ? (
            topMatches.map((job) => (
              <View key={job._id} style={styles.card}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{job.fitScore}% MATCH</Text>
                </View>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobSub}>
                  {job.companyName} • {job.location}
                </Text>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => router.push({ pathname: '/(roles)/student/JobDetailScreen', params: { jobId: job._id } })}
                >
                  <Text style={styles.applyText}>View Details & Apply</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 24, backgroundColor: '#FFF9E6', borderColor: '#FFE082' }]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>💪</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.text.primary, marginBottom: 4 }}>Oops! No 80%+ Matches Yet</Text>
              <Text style={{ textAlign: 'center', color: COLORS.text.secondary, fontSize: 13, lineHeight: 20 }}>
                Time to put in some hard work! The AI says you need to boost your profile strength. Follow the tips above!
              </Text>
            </View>
          )}
          <View style={{ height: 40 }}/>
        </ScrollView>
      </ScreenWrapper>
    </View>
  );
}

const ActionCard = ({ icon, title, onPress, disabled }) => (
  <TouchableOpacity 
    style={[styles.actionCard, disabled && { opacity: 0.5 }]} 
    onPress={onPress}
    disabled={disabled}
  >
    <View style={[styles.iconCircle, disabled && { backgroundColor: COLORS.border }]}>
      <Feather name={icon} size={20} color={disabled ? COLORS.text.secondary : COLORS.secondary} />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginTop: 0, 
    marginBottom: 25
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary
  },
  subtext: {
    color: COLORS.text.secondary,
    marginTop: 4
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: 12
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10
  },
  progressText: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: -8, 
    marginBottom: 8
  },
  helperText: {
    flex: 1,
    color: COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 20
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  actionTitle: {
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center'
  },
  badge: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D32'
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary
  },
  jobSub: {
    color: COLORS.text.secondary,
    marginTop: 4,
    marginBottom: 14
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  applyText: {
    color: '#fff',
    fontWeight: '700'
  },
  guardCardInline: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.surface, 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: COLORS.primary, 
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  guardIconBoxInline: { width: 60, height: 60, borderRadius: 30, backgroundColor: `${COLORS.primary}10`, justifyContent: 'center', alignItems: 'center' },
  guardTitleInline: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  guardSubInline: { fontSize: 13, color: COLORS.text.secondary, marginBottom: 12, lineHeight: 18 },
  guardBtnInline: { alignSelf: 'flex-start', flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: 'center', gap: 6 },
  guardBtnTextInline: { color: '#fff', fontSize: 13, fontWeight: '700' }
});