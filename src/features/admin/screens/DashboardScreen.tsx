import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { FormButton } from '../../../shared/components/forms/FormButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../navigation/types';

export const AdminDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <View style={styles.buttonsContainer}>
          <FormButton
            title="User Management"
            onPress={() => navigation.navigate('UserManagement')}
            style={styles.button}
          />
          <FormButton
            title="System Settings"
            onPress={() => navigation.navigate('SystemSettings')}
            style={styles.button}
          />
          <FormButton
            title="View Reports"
            onPress={() => navigation.navigate('Reports')}
            style={styles.button}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    width: '100%',
  },
});