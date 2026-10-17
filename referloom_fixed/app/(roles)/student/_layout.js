import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../../src/theme/colors';

export default function StudentLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: COLORS.primary,
      tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 10 }
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} /> }} />
      <Tabs.Screen name="JobMatchScreen" options={{ title: 'Jobs', tabBarIcon: ({ color }) => <Feather name="briefcase" size={24} color={color} /> }} />
      <Tabs.Screen name="OffersScreen" options={{ title: 'Offers', tabBarIcon: ({ color }) => <Feather name="bell" size={24} color={color} /> }} />
      <Tabs.Screen name="StudentProfileScreen" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} /> }} />
      
      {/* Hidden Screens (href: null hides them from the bottom tab bar) */}
      <Tabs.Screen name="AddExperienceScreen" options={{ href: null }} />
      <Tabs.Screen name="CareerSetupScreen" options={{ href: null }} />
      <Tabs.Screen name="EditProfile" options={{ href: null }} />
      <Tabs.Screen name="CollaborationBoard" options={{ href: null }} />
      <Tabs.Screen name="UploadProjectScreen" options={{ href: null }} />
      <Tabs.Screen name="StudentProjectScreen" options={{ href: null }} />
      <Tabs.Screen name="JobDetailScreen" options={{ href: null }} />
      <Tabs.Screen name="StudentExploreScreen" options={{ href: null }} />
      <Tabs.Screen name="MentorshipRequestScreen" options={{ href: null }} />
      <Tabs.Screen name="StudentChatScreen" options={{ href: null }} />
      // Add this line to the bottom of your app/(roles)/student/_layout.js
<Tabs.Screen name="ChatRoomScreen" options={{ href: null }} />
      
    </Tabs>
  );
}