import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../../src/theme/colors';

export default function CompanyLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.text.secondary,
      tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 10, backgroundColor: COLORS.surface, borderTopColor: COLORS.border }
    }}>
      {/* VISIBLE BOTTOM TABS */}
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Feather name="grid" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="JobsScreen" 
        options={{ title: 'Jobs', tabBarIcon: ({ color }) => <Feather name="briefcase" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="CompanyProfileScreen" 
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} /> }} 
      />
      
      {/* HIDDEN STACKS (Triggered via buttons/actions) */}
      {/* Hidden Stacks (Not visible on bottom tab bar) */}
<Tabs.Screen name="PostJobScreen" options={{ href: null }} />
<Tabs.Screen name="JobDetailScreen" options={{ href: null }} />
<Tabs.Screen name="JobApplicantsScreen" options={{ href: null }} />
<Tabs.Screen name="ViewStudentProfileScreen" options={{ href: null }} />
    </Tabs>
  );
}