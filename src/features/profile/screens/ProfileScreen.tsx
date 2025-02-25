import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useAuth } from '../../../hooks/useAuth';
import { CustomButton } from '../../../shared/components/Button/CustomButton';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>{user?.displayName}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>

        <CustomButton 
          title="Logout" 
          onPress={logout}
          variant="primary"
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#666',
  },
});