import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import api from '../../../src/services/api';
import { COLORS } from '../../../src/theme/colors';
import ScreenWrapper from '../../../src/components/ui/ScreenWrapper';

export default function StudentChatScreen() {
  const router = useRouter();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await api.get('/mentorship/requests');

      // ✅ only accepted chats
      const accepted = res.data.filter(r => r.status === 'accepted');

      setChats(accepted);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const user = item.alumni;

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() =>
          router.push({
            pathname: '/(roles)/student/ChatRoomScreen',
            params: {
              userId: user?._id,
              name: user?.fullName,
              company: user?.professionalDetails?.companyName
            }
          })
        }
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0) || 'U'}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.chatInfo}>
          <Text style={styles.name}>
            {user?.fullName || 'Unknown'}
          </Text>
          <Text style={styles.company}>
            {user?.professionalDetails?.companyName || 'Alumni'}
          </Text>

          <Text style={styles.lastMsg}>
            Tap to start conversation →
          </Text>
        </View>

        {/* Arrow */}
        <Feather name="chevron-right" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

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

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Chats</Text>
          <Text style={styles.subtitle}>
            Mentors & connections ready to chat
          </Text>
        </View>

        {/* LIST */}
        <FlatList
          data={chats}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="message-circle" size={40} color="#ccc" />
              <Text style={styles.emptyText}>
                No chats yet. Get mentorship accepted first.
              </Text>
            </View>
          }
        />
      </View>
    </ScreenWrapper>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.border
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary
  },

  subtitle: {
    color: COLORS.text.secondary,
    marginTop: 4
  },

  list: {
    padding: 16
  },

  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center'
  },

  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2'
  },

  chatInfo: {
    flex: 1,
    marginLeft: 12
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary
  },

  company: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2
  },

  lastMsg: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  },

  empty: {
    alignItems: 'center',
    marginTop: 80
  },

  emptyText: {
    marginTop: 10,
    color: '#888',
    textAlign: 'center'
  }
});