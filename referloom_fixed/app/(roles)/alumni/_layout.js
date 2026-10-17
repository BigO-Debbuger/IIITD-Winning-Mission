import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../../src/theme/colors';

export default function AlumniLayout() {
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
        name="AlumniChatScreen" 
        options={{ title: 'Chats', tabBarIcon: ({ color }) => <Feather name="message-circle" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="PostJobScreen" 
        options={{ title: 'Jobs', tabBarIcon: ({ color }) => <Feather name="briefcase" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="AlumniHomeScreen" // This acts as the Profile tab
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} /> }} 
      />

      {/* HIDDEN STACKS */}
      <Tabs.Screen name="EditAlumniProfile" options={{ href: null }} />
      <Tabs.Screen name="MentorshipSessionScreen" options={{ href: null }} />
      <Tabs.Screen name="ViewStudentProfileScreen" options={{ href: null }} />
      <Tabs.Screen name="AlumniExploreScreen" options={{ href: null }} />
      <Tabs.Screen name="JobMatchesScreen" options={{ href: null }} />
        <Tabs.Screen name="AlumniApplicantsScreen" options={{ href: null }} />
        <Tabs.Screen name="AlumniChatDetailScreen" options={{ href: null }} />
        <Tabs.Screen name="AlumniAIMatchesScreen" options={{ href: null }} />


    </Tabs>
  );
}