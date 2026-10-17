import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

export default function CustomInput({ 
  label, 
  icon, 
  error, 
  password, 
  ...props 
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(password);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focusedContainer,
        error && styles.errorContainer
      ]}>
        {icon && <Feather name={icon} size={20} color={isFocused ? COLORS.primary : '#9CA3AF'} style={styles.icon} />}
        
        <TextInput
          style={styles.input}
          secureTextEntry={hidePassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
          {...props}
        />

        {password && (
          <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
            <Feather 
              name={hidePassword ? "eye-off" : "eye"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  focusedContainer: { borderColor: COLORS.primary, backgroundColor: '#FFFFFF' },
  errorContainer: { borderColor: '#EF4444' },
  input: { flex: 1, fontSize: 16, color: COLORS.text.primary },
  icon: { marginRight: 12 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 }
});