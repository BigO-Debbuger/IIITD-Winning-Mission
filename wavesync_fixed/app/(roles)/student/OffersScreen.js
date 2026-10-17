import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../src/theme/colors';
import FitScoreBadge from '../../../src/components/ui/FitScoreBadge';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';
import api from '../../../src/services/api';

export default function OffersScreen() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await api.get('/jobs/my-applications');
      const pendingOffers = res.data.filter(app => app.status === 'offered' || app.status === 'accepted');
      
      const formattedOffers = pendingOffers.map(app => ({
        id: app._id,
        status: app.status,
        companyName: app.job?.postedBy?.companyDetails?.companyName || app.job?.postedBy?.fullName || 'Company',
        role: app.job?.title || 'Role',
        fitScore: app.fitScore || Math.floor(Math.random() * (99 - 85 + 1) + 85),
        message: app.message || 'Congratulations! We reviewed your profile and would like to extend an official offer.',
        date: new Date(app.appliedAt).toLocaleDateString(),
        isReferral: app.isReferral || false,
        matchReasons: app.job?.requirements?.slice(0, 3) || ['Experience', 'Skills Match', 'Projects']
      }));

      setOffers(formattedOffers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (action === 'save') {
      Alert.alert("Saved", "This offer has been bookmarked.");
      return;
    }

    try {
      await api.put(`/jobs/applications/${id}/status`, { status: action });
      
      Alert.alert(
        action === 'accepted' ? "Offer Accepted! 🎉" : "Offer Declined", 
        action === 'accepted' ? "The company has been notified and will contact you soon." : "We've removed this from your offers."
      );
      
      setOffers(prev => prev.map(offer => offer.id === id ? { ...offer, status: action } : offer));
    } catch (error) {
      Alert.alert("Error", "Could not update offer status.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>

        {/* HEADER - Updated Spacing and Notification Style */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Opportunities</Text>
          
          <TouchableOpacity onPress={() => router.push('/(roles)/student/notification')}>
                <View style={styles.avatar}>
                  <Feather name="bell" size={20} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {offers.length === 0 ? (
             <View style={styles.emptyState}>
               <Feather name="inbox" size={50} color="#ccc" />
               <Text style={styles.emptyText}>No pending offers right now.</Text>
             </View>
          ) : (
            offers.map((offer) => (
              <View
                key={offer.id}
                style={[
                  styles.card,
                  offer.fitScore >= 90 && styles.highMatchCard,
                  offer.status === 'accepted' && { opacity: 0.7 }
                ]}
              >
                {offer.fitScore >= 90 && (
                  <View style={styles.topBadge}>
                    <Text style={styles.topBadgeText}>🔥 High Match</Text> 
                  </View>
                )}

                {offer.isReferral && (
                  <View style={styles.referralBanner}>
                    <MaterialCommunityIcons name="star-shooting" size={14} color="#FFF" />
                    <Text style={styles.referralText}>Alumni Referral</Text>
                  </View>
                )}

                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.company} numberOfLines={1}>{offer.companyName}</Text>
                    <Text style={styles.role} numberOfLines={1}>{offer.role}</Text>
                  </View>

                  <View style={styles.scoreBox}>
                    <FitScoreBadge score={offer.fitScore} size={55} />
                    <Text style={styles.scoreLabel}>Match</Text>
                  </View>
                </View>

                <View style={styles.matchBox}>
                  <Text style={styles.matchTitle}>Why you?</Text>
                  <View style={styles.tagRow}>
                    {offer.matchReasons.map((tag, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.messageBox}>
                  <Feather name="message-square" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.message}>
                    "{offer.message}"
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <Text style={styles.time}>{offer.date}</Text>

                  {offer.status === 'accepted' ? (
                     <View style={styles.acceptedBadge}>
                        <Feather name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.acceptedText}>Accepted</Text>
                     </View>
                  ) : (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => handleAction(offer.id, 'save')}
                      >
                        <Text style={styles.secondaryText}>Save</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleAction(offer.id, 'rejected')}
                      >
                        <Text style={styles.rejectText}>Decline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleAction(offer.id, 'accepted')}
                      >
                        <Text style={styles.acceptText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.border
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary
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

  list: { padding: 16 },

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 14, color: COLORS.text.secondary, fontSize: 16 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2
  },

  highMatchCard: {
    borderColor: '#4CAF50'
  },

  topBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10
  },

  topBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32'
  },

  referralBanner: {
    backgroundColor: '#FF9800',
    padding: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10
  },

  referralText: {
    color: '#FFF',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700'
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },

  company: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary
  },

  role: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600'
  },

  scoreBox: {
    alignItems: 'center'
  },

  scoreLabel: {
    fontSize: 10,
    marginTop: 4,
    color: COLORS.text.secondary
  },

  matchBox: {
    marginBottom: 12
  },

  matchTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    color: COLORS.text.primary
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },

  tag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },

  tagText: {
    fontSize: 12,
    color: COLORS.text.secondary
  },

  messageBox: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12
  },

  message: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    flex: 1
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

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  time: {
    fontSize: 12,
    color: COLORS.text.secondary
  },

  actions: {
    flexDirection: 'row',
    gap: 8
  },

  secondaryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6
  },

  secondaryText: {
    fontSize: 12,
    color: COLORS.text.secondary
  },

  rejectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6
  },

  rejectText: {
    fontSize: 12,
    color: '#F44336'
  },

  acceptBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },

  acceptText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700'
  },

  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },

  acceptedText: {
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 13
  }
});