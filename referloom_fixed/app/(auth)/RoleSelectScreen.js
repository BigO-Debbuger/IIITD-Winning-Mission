import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Using your dynamic colors import
import { COLORS } from '../../src/theme/colors'; 

export default function RoleSelection() {
  // LOGIC STRICTLY UNTOUCHED
  const router = useRouter();

  const handleRoleSelect = (role) => {
    router.push({ pathname: '/(auth)/register', params: { role } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Join ReferLoom</Text>
          <Text style={styles.subtitle}>Select your profile type to customize your experience.</Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Student Card */}
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7} 
            onPress={() => handleRoleSelect('student')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="school" size={28} color={COLORS.secondary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Student</Text>
              <Text style={styles.cardDescription}>Showcase projects and find job matches.</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Alumni Card */}
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7} 
            onPress={() => handleRoleSelect('alumni')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="briefcase" size={28} color={COLORS.secondary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Alumni</Text>
              <Text style={styles.cardDescription}>Mentor students and refer top talent.</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Company Card */}
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7} 
            onPress={() => handleRoleSelect('company')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="business" size={28} color={COLORS.secondary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Company / HR</Text>
              <Text style={styles.cardDescription}>Hire verified students and post jobs.</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        {/* NAVIGATION STRICTLY UNTOUCHED */}
        <TouchableOpacity 
          style={styles.bottomLink} 
          onPress={() => router.push('/(auth)/LoginScreen')}
        >
          <Text style={styles.bottomLinkText}>
            Already have an account? <Text style={styles.bottomLinkTextBold}>Log In</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  container: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center' 
  },
  header: { 
    marginBottom: 40 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: COLORS.primary, 
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 16, 
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  cardsContainer: { 
    gap: 16 
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${COLORS.secondary}15`, // Mint green with 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: { 
    flex: 1 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.text.primary, 
    marginBottom: 4 
  },
  cardDescription: { 
    fontSize: 14, 
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  bottomLink: { 
    marginTop: 40, 
    alignItems: 'center',
    paddingVertical: 12,
  },
  bottomLinkText: { 
    fontSize: 15, 
    color: COLORS.text.secondary 
  },
  bottomLinkTextBold: { 
    color: COLORS.primary, 
    fontWeight: '700' 
  },
});