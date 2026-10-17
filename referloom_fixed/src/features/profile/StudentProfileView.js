import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useProfileAccess } from '../../hooks/useProfileAccess';
import BasicProfileCard from '../../components/profile/BasicProfileCard';
import LockedProfileState from '../../components/profile/LockedProfileState';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import PrimaryButton from '../ui/PrimaryButton';

// Assume targetProfile is passed down via route params or fetched from API
export default function StudentProfileView({ targetProfile }) {
  const accessLevel = useProfileAccess(targetProfile);
  const { user } = useAuth();
  const [requestPending, setRequestPending] = useState(false);

  const handleRequestAccess = () => {
    // API Call goes here: api.post('/requests', { targetId: targetProfile.userId })
    setRequestPending(true);
    alert("Access request sent to " + targetProfile.fullName);
  };

  if (!targetProfile) return <Text>Loading...</Text>;

  const handleReferral = () => {
    // Navigate the Alumni to a specific referral form or trigger an API call
    alert(`You have marked ${targetProfile.fullName || 'this student'} as Highly Recommended!`);
  };

  if (!targetProfile) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <BasicProfileCard profile={targetProfile} />

      {/* ✨ ALUMNI REFERRAL BUTTON: Only shows if viewer is Alumni AND has Full Access */}
      {user?.role === 'alumni' && accessLevel === 'FULL' && (
         <View style={{ padding: 20, paddingBottom: 0 }}>
            <PrimaryButton 
              title="🏆 Refer to Company" 
              onPress={handleReferral} 
              style={{ backgroundColor: COLORS.secondary }} // Use green/accent color for referrals
            />
         </View>
      )}

      {/* Conditional Rendering Engine */}
      {accessLevel === 'FULL' ? (
         <View style={styles.fullContent}>
            {/* ... rest of the full portfolio ... */}
         </View>
      ) : (
         <LockedProfileState 
            onRequestAccess={handleRequestAccess} 
            isPending={requestPending} 
         />
      )}
    </ScrollView>
  );
}
    <ScrollView style={styles.container}>
      {/* 1. Everyone sees the basic card */}
      <BasicProfileCard profile={targetProfile} />

      {/* 2. Conditional Rendering Engine */}
      {accessLevel === 'FULL' ? (
         <View style={styles.fullContent}>
            <Text style={styles.sectionTitle}>Projects & Portfolio</Text>
            {/* Render your Project Cards here */}
            
            <Text style={styles.sectionTitle}>Resume & Contact</Text>
            {/* Render Resume links/emails here */}
         </View>
      ) : (
         <LockedProfileState 
            onRequestAccess={handleRequestAccess} 
            isPending={requestPending} 
         />
      )}
    </ScrollView>
  

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  fullContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 16, marginTop: 10 }
});