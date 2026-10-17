import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image'; // ✨ IMPORT EXPO-IMAGE
import { COLORS } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';

// A tiny encoded string that shows a blurry placeholder while the real image loads
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function BasicProfileCard({ profile }) {
  return (
    <View style={styles.card}>
      <Image 
        source={profile.avatarUrl || 'https://i.pravatar.cc/150'} 
        placeholder={blurhash} // ✨ Shows blur while loading
        contentFit="cover"     // ✨ Replaces resizeMode
        transition={300}       // ✨ Smooth fade-in
        style={styles.avatar} 
      />
      {/* ... rest of the card components ... */}
    </View>
  );
}

// ... styles remain the same